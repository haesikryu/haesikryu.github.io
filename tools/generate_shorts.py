import os
import glob
import re
import datetime
from openai import OpenAI
import google.generativeai as genai
from moviepy.editor import *
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import pickle
import textwrap

# Configuration
POSTS_DIR = "_posts/news"
OUTPUT_DIR = "shorts_output"
ASSETS_DIR = "assets"
# Try local font first, then fallback to NanumGothic (installed via apt), then Arial
font_path = "assets/font.ttf" 
if not os.path.exists(font_path):
    # On Ubuntu with fonts-nanum, this is a common path or we can use the font name directly with ImageMagick
    font_path = "NanumGothic"

background_video_path = os.path.join(ASSETS_DIR, "media", "background.mp4")

# YouTube API scopes
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def get_latest_post():
    """Finds the most recent markdown post in _posts/news"""
    list_of_files = glob.glob(os.path.join(POSTS_DIR, '*.md'))
    if not list_of_files:
        return None
    latest_file = max(list_of_files, key=os.path.getctime)
    return latest_file

def extract_content(filepath):
    """Extracts headlines and summaries from the markdown file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find headings and summaries
    # Assuming format: ## 1. Title \n **Summary:** ...
    items = []
    # This regex needs to be robust to the actual output of daily_news.py
    # daily_news.py output format:
    # ## 1. Title
    # **Summary:** ...
    
    sections = re.split(r'## \d+\. ', content)
    for section in sections[1:]: # Skip preamble
        lines = section.strip().split('\n')
        title = lines[0].strip()
        summary = ""
        for line in lines:
            if "**Summary:**" in line:
                summary = line.replace("**Summary:**", "").strip()
                break
        if title and summary:
            items.append({'title': title, 'summary': summary})
            
    return items[:3] # Limit to top 3 for a 60s short

import asyncio
import edge_tts
import requests
import random
import PIL.Image

# Monkey patch for MoviePy compatibility with Pillow 10+
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS

def get_pexels_video(query, orientation='portrait', size='medium', duration_min=5):
    """Searches Pexels for a video and returns the download URL"""
    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        print("PEXELS_API_KEY not found, using default background.")
        return None

    headers = {'Authorization': api_key}
    url = f"https://api.pexels.com/videos/search?query={query}&orientation={orientation}&size={size}&per_page=5"
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        if not data.get('videos'):
            return None
        
        # Pick a random video from the top 5 results
        video = random.choice(data['videos'])
        video_files = video.get('video_files', [])
        
        # Find best quality that is not too huge (HD is good)
        link = None
        for file in video_files:
             if file['quality'] == 'hd' and file['width'] < file['height']: # Vertical HD
                 link = file['link']
                 break
        if not link and video_files: # Fallback
             link = video_files[0]['link']
             
        return link
    except Exception as e:
        print(f"Pexels API Error: {e}")
        return None

def download_video(url, filename):
    r = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
    return filename

def generate_script_and_keywords(items):
    """Uses Gemini to generate script AND search keywords"""
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY not found.")
    
    genai.configure(api_key=gemini_key)
    
    # Try models... (restoring gemini-flash-latest which worked previously)
    models_to_try = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro']
    
    news_text = "\n".join([f"- {item['title']}: {item['summary']}" for item in items])
    
    prompt = f"""
    You are a YouTube Shorts creator. 
    1. Write a script for a 50-60 second video based on the news below.
    2. Suggest 3 English search keywords for stock videos (one for each news item).
    
    News Items:
    {news_text}
    
    Format your response EXACTLY like this:
    KEYWORDS: keyword1, keyword2, keyword3
    SCRIPT:
    (Your script here)
    
    Requirements:
    - Keywords must be simple English nouns (e.g., "Robot", "Chip", "Office").
    - Script must be in Korean, engaging, and fast.
    """
    
    response_text = ""
    for model_name in models_to_try:
        try:
             model = genai.GenerativeModel(model_name)
             response = model.generate_content(prompt)
             if response.text:
                 response_text = response.text
                 break
        except Exception as e:
            print(f"Failed with {model_name}: {e}")
            continue

    if not response_text:
         return ["AI Technology"], "Today's top AI news! " + items[0]['summary']
    
    lines = response_text.strip().split('\n')
    keywords = []
    script_lines = []
    
    mode = "start"
    for line in lines:
        if line.startswith("KEYWORDS:"):
            k_text = line.replace("KEYWORDS:", "").strip()
            keywords = [k.strip() for k in k_text.split(',')]
        elif line.startswith("SCRIPT:"):
            mode = "script"
        elif mode == "script":
            script_lines.append(line)
            
    final_script = "\n".join(script_lines).strip()
    return keywords, final_script.replace("*", "")

from gtts import gTTS

async def generate_audio_async(script, output_path):
    """Generates audio using Edge TTS, falling back to gTTS if it fails"""
    # Voices: 
    # ko-KR-SunHiNeural (Female, Soft/Professional)
    # ko-KR-SeoHyeonNeural (Female, Young/Bright)
    
    # User requested: Soft 20s female voice, faster speed
    voice = "ko-KR-SeoHyeonNeural" 
    rate = "+20%" # Increase speed by 20%
    
    # Retry logic
    for attempt in range(3):
        try:
            communicate = edge_tts.Communicate(script, voice, rate=rate)
            await communicate.save(output_path)
            return output_path
        except Exception as e:
            print(f"Edge TTS failed ({e}). Attempt {attempt + 1}/3. Retrying...")
            if attempt == 2: # Last attempt failed
                print("All Edge TTS attempts failed. Falling back to Google TTS (gTTS)...")
                break
    
    # Fallback to gTTS
    try:
        # Save to a temporary file first because gTTS is synchronous and we are in async function
        # But we can just run it here.
        tts = gTTS(text=script, lang='ko')
        tts.save(output_path)
        print("Generated audio using gTTS.")
        return output_path
    except Exception as e:
         print(f"gTTS also failed: {e}")
         raise

def generate_audio(script, output_path):
    """Wrapper to run async audio generation"""
    asyncio.run(generate_audio_async(script, output_path))
    return output_path

def create_video(audio_path, script_text, output_video_path, keywords=None):
    """Composes the video using MoviePy"""
    # Load audio
    audio_clip = AudioFileClip(audio_path)
    duration = audio_clip.duration
    
    clips = []
    
    # Download backgrounds or use default
    bg_files = []
    if keywords and os.environ.get("PEXELS_API_KEY"):
         print(f"Searching videos for: {keywords}")
         for i, kw in enumerate(keywords):
             link = get_pexels_video(kw)
             if link:
                 fname = os.path.join(ASSETS_DIR, "media", f"temp_bg_{i}.mp4")
                 download_video(link, fname)
                 bg_files.append(fname)
    
    if not bg_files:
        # Fallback to default background loop
        print("Using default background.")
        if os.path.exists(background_video_path):
            bg_clip = VideoFileClip(background_video_path).resize(height=1920)
            # Loop it to match duration
            bg_clip = vfx.loop(bg_clip, duration=duration)
            # Center crop to 9:16
            bg_clip = bg_clip.crop(x1=bg_clip.w/2 - 540, width=1080, height=1920)
            clips.append(bg_clip)
        else:
            # Fallback to solid color
            bg_clip = ColorClip(size=(1080, 1920), color=(20, 20, 30), duration=duration)
            clips.append(bg_clip)
    else:
        # Stitch Pexels videos
        # Calculate duration per clip
        clip_duration = duration / len(bg_files)
        for f in bg_files:
            clip = VideoFileClip(f).resize(height=1920)
            # Center crop to 9:16 (1080x1920)
            if clip.w / clip.h > 9/16:
                 clip = clip.crop(x1=clip.w/2 - 540, width=1080, height=1920)
            
            # Retrieve subclip or loop if too short
            if clip.duration < clip_duration:
                 clip = vfx.loop(clip, duration=clip_duration)
            else:
                 clip = clip.subclip(0, clip_duration)
            clips.append(clip)
            
    if len(clips) > 1:
        final_bg = concatenate_videoclips(clips, method="compose")
    elif clips:
        final_bg = clips[0].set_duration(duration)
    else: # Should not happen if fallback is robust
        final_bg = ColorClip(size=(1080, 1920), color=(20, 20, 30), duration=duration)


    # ... (Overlay Text Logic - keep existing but adapt)
    # Re-use the existing text logic but apply to final_bg
    
    # Create Title Text
    # Ensure font exists
    if not os.path.exists(font_path):
        print("Font not found, using default.")
        # ... logic to manage font ...

    # Just creating a simple title overlay for now to verify integration
    txt_clip = TextClip("Daily AI News", fontsize=70, color='white', font=font_path, size=(800, 200), method='caption')
    txt_clip = txt_clip.set_pos(('center', 150)).set_duration(duration)
    
    final_video = CompositeVideoClip([final_bg, txt_clip])
    final_video = final_video.set_audio(audio_clip)
    
    final_video.write_videofile(output_video_path, codec="libx264", audio_codec="aac", fps=24)
    
    # Cleanup temp files
    for f in bg_files:
        if os.path.exists(f): os.remove(f)
    return output_video_path

def authenticate_youtube():
    """Authenticates with YouTube API using saved tokens or Environment Variables"""
    creds = None
    token_path = 'token.pickle'
    
    # 1. Try local pickle file
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
            
    # 2. Try Environment Variables (CI/CD)
    if not creds or not creds.valid:
        if os.environ.get("YOUTUBE_REFRESH_TOKEN"):
             from google.oauth2.credentials import Credentials
             creds = Credentials(
                 None, # Access token (will be refreshed)
                 refresh_token=os.environ.get("YOUTUBE_REFRESH_TOKEN"),
                 token_uri="https://oauth2.googleapis.com/token",
                 client_id=os.environ.get("YOUTUBE_CLIENT_ID"),
                 client_secret=os.environ.get("YOUTUBE_CLIENT_SECRET"),
                 scopes=SCOPES
             )
        
    # 3. Refresh if needed
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
    if not creds or not creds.valid:
        print("Authentication failed. No valid token or environment variables found.")
        return None
            
    return build('youtube', 'v3', credentials=creds)

def upload_video(youtube, file_path, title, description):
    """Uploads video to YouTube"""
    body = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': ['AI', 'TechNews', 'Shorts'],
            'categoryId': '28' # Science & Technology
        },
        'status': {
            'privacyStatus': 'private', # Default to private for safety
            'selfDeclaredMadeForKids': False
        }
    }

    media = MediaFileUpload(file_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(
        part=','.join(body.keys()),
        body=body,
        media_body=media
    )
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Uploaded {int(status.progress() * 100)}%")
    
    print(f"Upload Complete! Video ID: {response['id']}")

def main():
    if not os.environ.get("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY not found.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 1. Get Content
    latest_post = get_latest_post()
    if not latest_post:
        print("No news posts found.")
        return
    print(f"Processing {latest_post}...")
    
    items = extract_content(latest_post)
    if not items:
        print("No items extracted.")
        return

    # 2. Generate Script & Keywords
    print("Generating script...")
    keywords, script = generate_script_and_keywords(items)
    print(f"Keywords: {keywords}")
    print("Script:", script)
    
    # 3. Generate Audio
    print("Generating audio...")
    audio_path = os.path.join(OUTPUT_DIR, "audio.mp3")
    generate_audio(script, audio_path)
    
    # 4. Create Video
    print("Creating video...")
    video_path = os.path.join(OUTPUT_DIR, "short.mp4")
    create_video(audio_path, script, video_path, keywords=keywords)
    
    # 5. Upload (Optional, if tokens exist)
    print("Attempting upload to YouTube...")
    youtube = authenticate_youtube()
    if youtube:
        upload_video(youtube, video_path, "Daily AI News #Shorts", "Generated by AI")
    else:
        print("Skipping upload (Auth failed). Set YOUTUBE_REFRESH_TOKEN env var or run get_youtube_token.py locally.")

if __name__ == "__main__":
    main()
