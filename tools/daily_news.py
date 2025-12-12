import os
import datetime
import feedparser
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import google.generativeai as genai
from openai import OpenAI
import time
import yaml
import glob
import re

# Configuration
RSS_FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://openai.com/blog/rss.xml",
    "https://blog.google/technology/ai/rss/"
]

# You can adjust the prompt here
PROMPT_TEMPLATE = """
You are a tech blogger. I will provide you with a list of recent news headlines and summaries from various tech sources.
Your task is to:
1. Select the top 5-7 most important and interesting stories related to AI and Technology from the last 24 hours.
2. Write a daily digest blog post in Korean.
3. The post should have a catchy title.
4. For each story, provide:
    - A clear title as a header (e.g. ## 1. Title)
    - A summary of what happened (labeled **Summary:**)
    - Why it matters (labeled **Why it matters:**)
    - A source link (labeled **Source:**)
5. Use proper Markdown formatting. **Do NOT use tables.** Use blockquotes (>) or regular paragraphs for the content to ensure it displays well on mobile devices.
6. Make it easy to read.

Here is the news data:
{news_data}

Return only the Markdown content for the blog post (excluding front matter).
"""

def fetch_news():
    news_items = []
    print("Fetching news from RSS feeds...")
    
    # Setup retry strategy
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    http = requests.Session()
    http.mount("https://", adapter)
    http.mount("http://", adapter)

    for url in RSS_FEEDS:
        try:
            # Use requests with timeout to fetch raw content first
            response = http.get(url, timeout=10)
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            print(f"Fetched {len(feed.entries)} items from {url}")
            for entry in feed.entries[:5]: # Take top 5 from each feed
                # filter for recent news (last 24 hours) if possible, but for simplicity just taking latest
                published = entry.get('published_parsed') or entry.get('updated_parsed')
                if published:
                    dt = datetime.datetime.fromtimestamp(time.mktime(published))
                    # simple check: if older than 24h, skip? 
                    # Let's keep it simple for now and rely on LLM to pick "best", 
                    # but usually feeds are sorted by date.
                
                news_items.append({
                    'title': entry.get('title', 'No Title'),
                    'link': entry.get('link', ''),
                    'summary': entry.get('summary', '')[:500] # truncate summary
                })
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    return news_items



def get_today_posted_urls():
    """
    Scans _posts/news/ for files created today (or matching today's date pattern)
    and extracts all links from them to avoid duplicates.
    """
    # Use KST (UTC+9)
    kst = datetime.timezone(datetime.timedelta(hours=9))
    now_kst = datetime.datetime.now(kst)
    today_str = now_kst.strftime('%Y-%m-%d')
    # Match files starting with YYYY-MM-DD-daily-ai-news
    pattern = os.path.join("_posts/news", f"{today_str}-daily-ai-news*.md")
    existing_files = glob.glob(pattern)
    
    posted_urls = set()
    
    link_pattern = re.compile(r'\[.*?\]\((http[s]?://.*?)\)')
    
    for filepath in existing_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # Find all links in the content
                links = link_pattern.findall(content)
                posted_urls.update(links)
                
                # Also check for "Link: " lines if we used that format before (though prompt changed)
                # Just to be safe, let's look for known source patterns if they are raw URLs
                # But regex above covers markdown links which is what we produce.
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            
    return posted_urls

def generate_blog_post(news_items):
    # Format news for the prompt
    news_text = ""
    for item in news_items:
        news_text += f"- Title: {item['title']}\n  Link: {item['link']}\n  Summary: {item['summary']}\n\n"

    prompt = PROMPT_TEMPLATE.format(news_data=news_text)

    # Check for API Keys
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    content = ""

    if gemini_key:
        print(f"Using Google Gemini... (Library Version: {genai.__version__})")
        genai.configure(api_key=gemini_key)
        # Try models in order of preference
        models_to_try = [
            'gemini-flash-latest',
            'gemini-pro-latest',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
            'gemini-pro'
        ]
        
        for model_name in models_to_try:
            try:
                print(f"Trying model: {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                content = response.text
                print(f"Success with {model_name}")
                break
            except Exception as e:
                print(f"Failed with {model_name}: {e}")
                continue
        
        if not content:
            print("All models failed. Listing available models:")
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        print(f"- {m.name}")
            except Exception as e:
                print(f"Could not list models: {e}")
            raise ValueError("Could not generate content with any model.")
    elif openai_key:
        print("Using OpenAI...")
        client = OpenAI(api_key=openai_key)
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content
    else:
        raise ValueError("No API Key found. Please set GEMINI_API_KEY or OPENAI_API_KEY.")

    return content

def save_post(content):
    kst = datetime.timezone(datetime.timedelta(hours=9))
    now_kst = datetime.datetime.now(kst)
    date_str = now_kst.strftime('%Y-%m-%d')
    base_filename = f"{date_str}-daily-ai-news"
    filename = f"{base_filename}.md"
    filepath = os.path.join("_posts/news", filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Generate unique filename
    counter = 1
    title_suffix = ""
    while os.path.exists(filepath):
        filename = f"{base_filename}-{counter}.md"
        filepath = os.path.join("_posts/news", filename)
        title_suffix = f" ({counter + 1})"
        counter += 1

    # Create front matter
    front_matter = {
        'layout': 'post',
        'title': f"{date_str} Daily AI & Tech News{title_suffix}",
        'date': now_kst.strftime('%Y-%m-%d %H:%M:%S %z'),
        'categories': ['news', 'ai'],
        'tags': ['daily-news', 'automation', 'ai']
    }
    
    # If the LLM returned a title in markdown (e.g. # Title), extraction might be needed,
    # but for now we use a generic title in frontmatter or let the user edit.
    # Actually, let's keep the generic title in FM and the LLM content below.

    full_content = f"---\n{yaml.dump(front_matter)}---\n\n{content}"

    with open(filepath, 'w') as f:
        f.write(full_content)
    
    print(f"Saved blog post to {filepath}")

def main():
    try:
        news = fetch_news()
        if not news:
            print("No news found from feeds.")
            return

        print(f"Collected {len(news)} news candidates.")
        
        # Deduplication
        posted_urls = get_today_posted_urls()
        if posted_urls:
            print(f"Found {len(posted_urls)} already posted URLs today.")
        
        new_news = []
        for item in news:
            if item['link'] not in posted_urls:
                new_news.append(item)
            else:
                print(f"Skipping duplicate: {item['title'][:30]}...")
                
        if not new_news:
            print("No new news items found (all duplicates).")
            return

        print(f"Proceeding with {len(new_news)} new items.")
        content = generate_blog_post(new_news)
        save_post(content)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)

if __name__ == "__main__":
    main()
