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

# 설정 (Configuration)
POSTS_DIR = "_posts/news"  # 뉴스 포스트가 저장된 디렉토리
OUTPUT_DIR = "shorts_output" # 생성된 쇼츠 영상이 저장될 디렉토리
ASSETS_DIR = "assets"      # 자산(이미지, 폰트 등) 디렉토리

# 폰트 경로 설정: 로컬 폰트를 먼저 시도하고, 없으면 나눔고딕(우분투 패키지), 그 다음 Arial 순으로 시도
font_path = "assets/font.ttf" 
if not os.path.exists(font_path):
    # 우분투에서 fonts-nanum 패키지가 설치된 경우의 일반적인 경로 또는 ImageMagick 사용 시 폰트 이름
    font_path = "NanumGothic"

background_video_path = os.path.join(ASSETS_DIR, "media", "background.mp4") # 기본 배경 동영상 경로

# YouTube API 접근 권한 범위 설정 (업로드 권한)
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def get_latest_post():
    """
    _posts/news 디렉토리에서 가장 최근에 생성된 마크다운 포스트 파일을 찾습니다.
    
    Returns:
        str: 가장 최근 파일의 경로, 파일이 없으면 None 반환
    """
    list_of_files = glob.glob(os.path.join(POSTS_DIR, '*.md'))
    if not list_of_files:
        return None
    # 파일 생성 시간을 기준으로 가장 최신 파일 선택
    latest_file = max(list_of_files, key=os.path.getctime)
    return latest_file

def extract_content(filepath):
    """
    마크다운 파일에서 뉴스의 제목(Headline)과 요약(Summary) 내용을 추출합니다.
    
    Args:
        filepath (str): 마크다운 파일 경로
        
    Returns:
        list: {'title': 제목, 'summary': 요약} 딕셔너리들의 리스트 (최대 3개)
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 제목과 요약을 찾기 위한 정규식 처리
    # daily_news.py의 출력 형식에 맞춰 파싱:
    # ## 1. 제목
    # **Summary:** 요약 내용 ...
    
    items = []
    
    # "## 숫자. " 패턴으로 섹션을 분리합니다.
    sections = re.split(r'## \d+\. ', content)
    for section in sections[1:]: # 첫 번째는 앞부분(preamble)이므로 건너뜁니다.
        lines = section.strip().split('\n')
        title = lines[0].strip() # 첫 줄은 제목
        summary = ""
        for line in lines:
            if "**Summary:**" in line:
                summary = line.replace("**Summary:**", "").strip() # "**Summary:**" 제거 후 공백 정리
                break
        if title and summary:
            items.append({'title': title, 'summary': summary})
            
    return items[:3] # 60초 쇼츠 길이를 고려하여 상위 3개 뉴스만 사용

import asyncio
import edge_tts
import requests
import random
import PIL.Image

# Pillow 10+ 버전과 MoviePy 호환성을 위한 몽키 패치 (ANTIALIAS 속성 문제 해결)
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS

def get_pexels_video(query, orientation='portrait', size='medium', duration_min=5):
    """
    Pexels API를 사용하여 검색어에 맞는 비디오를 검색하고 다운로드 URL을 반환합니다.
    
    Args:
        query (str): 검색어 (영어 키워드 권장)
        orientation (str): 영상 방향 (기본값: 'portrait' - 세로 모드)
        size (str): 크기 (기본값: 'medium')
        duration_min (int): 최소 길이 (사용되지 않음, API 파라미터가 아님)
        
    Returns:
        str: 비디오 다운로드 링크, 실패 시 None
    """
    api_key = os.environ.get("PEXELS_API_KEY")
    if not api_key:
        print("PEXELS_API_KEY를 찾을 수 없습니다. 기본 배경을 사용합니다.")
        return None

    headers = {'Authorization': api_key}
    # 검색 API 호출: 쿼리, 방향, 크기 지정, 결과 5개 요청
    url = f"https://api.pexels.com/videos/search?query={query}&orientation={orientation}&size={size}&per_page=5"
    
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        if not data.get('videos'):
            return None
        
        # 상위 5개 결과 중 무작위 선택
        video = random.choice(data['videos'])
        video_files = video.get('video_files', [])
        
        # HD 화질이면서 세로(width < height)인 영상을 우선 선택
        link = None
        for file in video_files:
             if file['quality'] == 'hd' and file['width'] < file['height']: # Vertical HD
                 link = file['link']
                 break
        if not link and video_files: # 적합한 파일이 없으면 첫 번째 파일 사용 (Fallback)
             link = video_files[0]['link']
             
        return link
    except Exception as e:
        print(f"Pexels API 오류: {e}")
        return None

def download_video(url, filename):
    """
    URL에서 비디오를 다운로드하여 파일로 저장합니다.
    """
    r = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
    return filename

def generate_script_and_keywords(items):
    """
    Gemini를 사용하여 뉴스 내용을 바탕으로 대본과 검색 키워드를 생성합니다.
    
    Args:
        items (list): 뉴스 아이템 리스트 [{'title': ..., 'summary': ...}]
        
    Returns:
        tuple: (키워드 리스트, 대본 문자열)
    """
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY가 환경 변수에 설정되어 있지 않습니다.")
    
    genai.configure(api_key=gemini_key)
    
    # 시도할 모델 목록: 최신 Flash 모델부터 순차적으로 시도
    models_to_try = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro']
    
    news_text = "\n".join([f"- {item['title']}: {item['summary']}" for item in items])
    
    prompt = f"""
    당신은 유튜브 쇼츠 크리에이터입니다.
    1. 아래 뉴스들을 바탕으로 50-60초 분량의 영상 대본을 작성해주세요.
    2. 주식 비디오 검색을 위한 영어 검색 키워드 3개를 제안해주세요 (각 뉴스 항목당 하나씩).
    
    뉴스 항목:
    {news_text}
    
    반드시 다음 형식을 정확히 지켜서 응답해주세요:
    KEYWORDS: 키워드1, 키워드2, 키워드3
    SCRIPT:
    (여기에 대본 내용 작성)
    
    요구사항:
    - 키워드는 단순한 영어 명사여야 합니다 (예: "Robot", "Chip", "Office").
    - 대본은 한국어로 작성하며, 흥미롭고 빠른 호흡이어야 합니다.
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
            print(f"{model_name} 모델로 생성 실패: {e}")
            continue

    # 생성 실패 시 기본값 반환
    if not response_text:
         return ["AI Technology"], "오늘의 주요 AI 뉴스입니다! " + items[0]['summary']
    
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
    return keywords, final_script.replace("*", "") # 마크다운 볼드 처리(*) 제거

from gtts import gTTS

async def generate_audio_async(script, output_path):
    """
    Edge TTS를 사용하여 오디오를 생성하고, 실패 시 gTTS로 대체합니다 (비동기 함수).
    
    Args:
        script (str): 오디오로 변환할 대본
        output_path (str): 저장할 오디오 파일 경로
    """
    # 사용 가능한 음성: 
    # ko-KR-SunHiNeural (여성, 부드러움/전문적)
    # ko-KR-SeoHyeonNeural (여성, 젊음/밝음)
    
    # 사용자 요구사항: 부드러운 20대 여성 목소리, 약간 빠른 속도
    voice = "ko-KR-SeoHyeonNeural" 
    rate = "+20%" # 속도 20% 증가
    
    # 재시도 로직 (최대 3회)
    for attempt in range(3):
        try:
            communicate = edge_tts.Communicate(script, voice, rate=rate)
            await communicate.save(output_path)
            return output_path
        except Exception as e:
            print(f"Edge TTS 실패 ({e}). 시도 {attempt + 1}/3. 재시도 중...")
            if attempt == 2: # 마지막 시도도 실패한 경우
                print("모든 Edge TTS 시도가 실패했습니다. Google TTS (gTTS)로 전환합니다...")
                break
    
    # gTTS를 사용한 대체 (Fallback)
    try:
        # gTTS는 동기식이지만 여기서 실행합니다.
        tts = gTTS(text=script, lang='ko')
        tts.save(output_path)
        print("gTTS를 사용하여 오디오 생성 완료.")
        return output_path
    except Exception as e:
         print(f"gTTS도 실패했습니다: {e}")
         raise

def generate_audio(script, output_path):
    """
    비동기 오디오 생성 함수를 실행하기 위한 동기 래퍼 함수입니다.
    """
    asyncio.run(generate_audio_async(script, output_path))
    return output_path

def create_video(audio_path, script_text, output_video_path, keywords=None):
    """
    MoviePy를 사용하여 비디오를 합성합니다. 배경 영상, 오디오, 텍스트 등을 합칩니다.
    
    Args:
        audio_path (str): 오디오 파일 경로
        script_text (str): 대본 텍스트 (현재는 영상 내 자막으로 사용되지 않음)
        output_video_path (str): 출력 비디오 파일 경로
        keywords (list): 배경 영상 검색을 위한 키워드 리스트
    """
    # 오디오 로드 및 길이 확인
    audio_clip = AudioFileClip(audio_path)
    duration = audio_clip.duration
    
    clips = []
    
    # 배경 비디오 다운로드 또는 기본값 사용
    bg_files = []
    if keywords and os.environ.get("PEXELS_API_KEY"):
         print(f"다음 키워드로 비디오 검색 중: {keywords}")
         for i, kw in enumerate(keywords):
             link = get_pexels_video(kw)
             if link:
                 fname = os.path.join(ASSETS_DIR, "media", f"temp_bg_{i}.mp4")
                 download_video(link, fname)
                 bg_files.append(fname)
    
    if not bg_files:
        # Pexels 검색 결과가 없거나 API 키가 없는 경우 기본 배경 사용
        print("기본 배경을 사용합니다.")
        if os.path.exists(background_video_path):
            bg_clip = VideoFileClip(background_video_path).resize(height=1920)
            # 오디오 길이에 맞춰 반복
            bg_clip = vfx.loop(bg_clip, duration=duration)
            # 9:16 비율로 중앙 크롭
            bg_clip = bg_clip.crop(x1=bg_clip.w/2 - 540, width=1080, height=1920)
            clips.append(bg_clip)
        else:
            # 배경 비디오 파일도 없으면 단색 배경 사용
            bg_clip = ColorClip(size=(1080, 1920), color=(20, 20, 30), duration=duration)
            clips.append(bg_clip)
    else:
        # Pexels에서 다운로드한 비디오들을 이어붙임
        # 각 클립의 할당 시간 계산
        clip_duration = duration / len(bg_files)
        for f in bg_files:
            clip = VideoFileClip(f).resize(height=1920)
            # 9:16 (1080x1920) 비율로 중앙 크롭
            if clip.w / clip.h > 9/16:
                 clip = clip.crop(x1=clip.w/2 - 540, width=1080, height=1920)
            
            # 클립 길이가 할당 시간보다 짧으면 반복, 길면 자르기
            if clip.duration < clip_duration:
                 clip = vfx.loop(clip, duration=clip_duration)
            else:
                 clip = clip.subclip(0, clip_duration)
            clips.append(clip)
            
    if len(clips) > 1:
        final_bg = concatenate_videoclips(clips, method="compose")
    elif clips:
        final_bg = clips[0].set_duration(duration)
    else: # 폴백이 제대로 동작했다면 이 경우는 발생하지 않아야 함
        final_bg = ColorClip(size=(1080, 1920), color=(20, 20, 30), duration=duration)


    # 텍스트 오버레이 로직 (기존 로직 유지 및 개선)
    
    # 제목 텍스트 생성
    # 폰트 존재 여부 확인
    if not os.path.exists(font_path):
        print("폰트를 찾을 수 없습니다. 기본값을 사용합니다.")
        # ... 폰트 관리 로직 필요 ...

    # 간단한 제목 오버레이 생성 (통합 확인용)
    txt_clip = TextClip("Daily AI News", fontsize=70, color='white', font=font_path, size=(800, 200), method='caption')
    txt_clip = txt_clip.set_pos(('center', 150)).set_duration(duration)
    
    # 비디오와 텍스트 합성
    final_video = CompositeVideoClip([final_bg, txt_clip])
    final_video = final_video.set_audio(audio_clip)
    
    # 최종 비디오 파일 쓰기 (H.264 코덱, AAC 오디오)
    final_video.write_videofile(output_video_path, codec="libx264", audio_codec="aac", fps=24)
    
    # 임시로 다운로드한 배경 파일 삭제
    for f in bg_files:
        if os.path.exists(f): os.remove(f)
    return output_video_path

def authenticate_youtube():
    """
    저장된 토큰이나 환경 변수를 사용하여 YouTube API에 인증합니다.
    """
    creds = None
    token_path = 'token.pickle'
    
    # 1. 로컬에 저장된 pickle 파일 확인
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
            
    # 2. pickle이 없거나 유효하지 않으면 환경 변수 사용 (CI/CD 환경 등)
    if not creds or not creds.valid:
        if os.environ.get("YOUTUBE_REFRESH_TOKEN"):
             from google.oauth2.credentials import Credentials
             creds = Credentials(
                 None, # 액세스 토큰 (새로 발급받음)
                 refresh_token=os.environ.get("YOUTUBE_REFRESH_TOKEN"),
                 token_uri="https://oauth2.googleapis.com/token",
                 client_id=os.environ.get("YOUTUBE_CLIENT_ID"),
                 client_secret=os.environ.get("YOUTUBE_CLIENT_SECRET"),
                 scopes=SCOPES
             )
        
    # 3. 토큰 만료 시 갱신 (Refresh)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
    if not creds or not creds.valid:
        print("인증 실패. 유효한 토큰이나 환경 변수를 찾을 수 없습니다.")
        return None
            
    return build('youtube', 'v3', credentials=creds)

def upload_video(youtube, file_path, title, description):
    """
    인증된 YouTube 객체를 사용하여 동영상을 업로드합니다.
    
    Args:
        youtube: authenticate_youtube()로 생성된 YouTube 리소스 객체
        file_path (str): 업로드할 영상 파일 경로
        title (str): 영상 제목
        description (str): 영상 설명
    """
    body = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': ['AI', 'TechNews', 'Shorts'],
            'categoryId': '28' # 28: 과학 & 기술 (Science & Technology)
        },
        'status': {
            'privacyStatus': 'private', # 안전을 위해 기본값은 비공개(private)
            'selfDeclaredMadeForKids': False
        }
    }

    # 다시 시작 가능한 업로드 (Resumable Upload) 설정
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
            print(f"업로드 진행률: {int(status.progress() * 100)}%")
    
    print(f"업로드 완료! 비디오 ID: {response['id']}")

def main():
    # Gemini API 키 확인
    if not os.environ.get("GEMINI_API_KEY"):
        print("오류: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 1. 콘텐츠 가져오기 (가장 최근 뉴스 포스트)
    latest_post = get_latest_post()
    if not latest_post:
        print("뉴스 포스트를 찾을 수 없습니다.")
        return
    print(f"{latest_post} 파일을 처리 중입니다...")
    
    items = extract_content(latest_post)
    if not items:
        print("항목을 추출하지 못했습니다.")
        return

    # 2. 대본 및 키워드 생성 (Gemini 사용)
    print("대본 생성 중...")
    keywords, script = generate_script_and_keywords(items)
    print(f"추출된 키워드: {keywords}")
    print("생성된 대본:", script)
    
    # 3. 오디오 생성 (TTS)
    print("오디오 생성 중...")
    audio_path = os.path.join(OUTPUT_DIR, "audio.mp3")
    generate_audio(script, audio_path)
    
    # 4. 비디오 생성 (편집)
    print("비디오 생성 중...")
    video_path = os.path.join(OUTPUT_DIR, "short.mp4")
    create_video(audio_path, script, video_path, keywords=keywords)
    
    # 5. 유튜브 업로드 (토큰이 있을 경우, 선택 사항)
    print("YouTube 업로드 시도 중...")
    youtube = authenticate_youtube()
    if youtube:
        upload_video(youtube, video_path, "Daily AI News #Shorts", "Generated by AI")
    else:
        print("업로드 건너뜀 (인증 실패). YOUTUBE_REFRESH_TOKEN 환경 변수를 설정하거나 로컬에서 get_youtube_token.py를 실행하세요.")

if __name__ == "__main__":
    main()
