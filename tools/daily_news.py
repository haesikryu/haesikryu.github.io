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
import json
import glob
import re

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "news_history.json")

# Configuration
RSS_FEEDS = [
    "https://news.hada.io/rss/news",  # GeekNews - 개발/기술/스타트업 뉴스
    "https://news.hada.io/rss/blog",  # GeekNews - 공지/기능 소식
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.theverge.com/rss/index.xml",
    "https://openai.com/blog/rss.xml",
    "https://blog.google/technology/ai/rss/",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.technologyreview.com/feed/",
    "https://huggingface.co/blog/feed.xml",
    "https://arstechnica.com/feed/",
    "https://news.microsoft.com/source/topics/ai/feed/",
    "https://deepmind.google/rss",
    "https://news.mit.edu/rss/topic/artificial-intelligence",
    "https://www.unite.ai/feed/",
    "https://www.artificialintelligence-news.com/feed/rss/"
]

# You can adjust the prompt here
PROMPT_TEMPLATE = """
You are a tech blogger. I will provide you with a list of recent news headlines and summaries from various tech sources.
Your task is to:
1. Select the top 3-5 most important and interesting stories related to AI and Technology from the last 24 hours.
2. Write a daily digest blog post in Korean.
3. Start with a simple greeting like "안녕하세요!" and do not use placeholders like [Your Name] or introduce yourself.
4. The post should have a catchy title.
5. For each story, provide comprehensive details (2-3 paragraphs per story):
    - A clear title as a header (e.g. ## 1. Title)
    - **Summary:** A detailed explanation of the event or announcement.
    - **Why it matters:** An analysis of its significance.
    - **Source:** [Link to Article](URL)
6. Use proper Markdown formatting. **Do NOT use tables.** Use blockquotes (>) or regular paragraphs.
7. Make it easy to read but informative.
8. If multiple sources cover the same topic, combine them into one strong entry.

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



def load_history():
    """Loads previously posted URLs from a JSON file."""
    if not os.path.exists(HISTORY_FILE):
        return {}
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading history: {e}")
        return {}

def save_history(history):
    """Saves the updated history to a JSON file."""
    # Prune old history (older than 7 days) to keep file size manageable
    # structure: { "url": "timestamp" } or just list?
    # Let's use a list of objects: [{"url": "...", "date": "YYYY-MM-DD", "title": "..."}]
    
    # Actually, simpler: just keep the list and prune based on date.
    # But for now, let's just save valid items.
    
    # Filter out items older than 7 days
    try:
        current_date = datetime.datetime.now()
        cutoff_date = current_date - datetime.timedelta(days=7)
        
        # history is expected to be a list of dicts
        new_history = []
        for item in history:
            item_date = datetime.datetime.strptime(item['date'], '%Y-%m-%d')
            if item_date > cutoff_date:
                new_history.append(item)
                
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(new_history, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Error saving history: {e}")

def get_posted_urls_from_history():
    history = load_history()
    # History is a list of dicts
    if isinstance(history, list):
         return {item.get('link') for item in history if item.get('link')}
    return set()

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


def _extract_first_title(content):
    """
    콘텐츠에서 첫 번째 뉴스 제목(## 1. 제목)을 그대로 추출하여 반환합니다.
    """
    if not content or not isinstance(content, str):
        return None
    m = re.search(r'^##\s*1\.\s*(.+?)(?:\n|$)', content.strip(), re.MULTILINE)
    if not m:
        return None
    title = m.group(1).strip()
    return title if title else None


def _title_to_slug(title):
    """제목 문자열을 파일명에 쓸 수 있는 슬러그로 변환합니다 (길이 제한 없음)."""
    if not title or not isinstance(title, str):
        return None
    invalid_chars = r'[\\/:*?"<>|\n\r\t]'
    slug = re.sub(invalid_chars, '', title)
    slug = re.sub(r'\s+', '-', slug).strip('-')
    return slug if slug else None


def _count_articles_in_content(content):
    """콘텐츠 내 '## N. 제목' 형식의 기사 개수를 반환합니다."""
    if not content or not isinstance(content, str):
        return 0
    matches = re.findall(r'^##\s*\d+\.\s', content.strip(), re.MULTILINE)
    return len(matches)


def _inject_article_count_badge(content, count):
    """본문 상단에 'N개의 기사가 실렸습니다' 문구를 넣습니다. 인사말 바로 다음 줄에 삽입."""
    if count <= 0:
        return content
    badge = f"\n\n이번 digest에는 **{count}개의 기사**가 실렸습니다.\n\n"
    lines = content.split("\n", 1)
    if len(lines) == 1:
        return content + badge
    first_line, rest = lines[0], lines[1]
    # 인사말 다음 공백 줄 정리 후 배지 삽입 (연속 빈 줄 방지)
    rest_after = rest.lstrip("\n")
    return first_line + badge + ("\n" if rest_after else "") + rest_after


def save_post(content):
    kst = datetime.timezone(datetime.timedelta(hours=9))
    # Subtract 5 minutes to ensure the post is in the past relative to build server time
    now_kst = datetime.datetime.now(kst) - datetime.timedelta(minutes=5)
    date_str = now_kst.strftime('%Y-%m-%d')
    suffix = "am" if now_kst.hour < 12 else "pm"
    
    # 블로그에 보이는 제목만 "첫 제목 등 N개 기사" 형식으로 설정 (파일명은 고정)
    first_title = _extract_first_title(content)
    article_count = _count_articles_in_content(content)
    if first_title and article_count > 0:
        display_title = f"{first_title} 등 {article_count}개 기사"
    else:
        display_title = f"{date_str} Daily AI & Tech News"
    
    base_filename = f"{date_str}-daily-ai-news-{suffix}"
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

    # 본문에 기사 개수 배지 삽입
    content_with_badge = _inject_article_count_badge(content, article_count)

    # Create front matter (제목에 중복 시 접미사만 추가)
    front_matter = {
        'layout': 'post',
        'title': f"{display_title}{title_suffix}",
        'date': now_kst.strftime('%Y-%m-%d %H:%M:%S %z'),
        'categories': ['news', 'ai'],
        'tags': ['daily-news', 'automation', 'ai']
    }
    
    full_content = f"---\n{yaml.dump(front_matter)}---\n\n{content_with_badge}"

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
        
        # Deduplication using History File
        history_items = load_history()
        posted_urls = set()
        if isinstance(history_items, list):
            posted_urls = {item.get('link') for item in history_items if item.get('link')}

        print(f"Found {len(posted_urls)} previously posted URLs in history.")
        
        new_news = []
        for item in news:
            if item['link'] not in posted_urls:
                new_news.append(item)
            else:
                # print(f"Skipping duplicate: {item['title'][:30]}...")
                pass # Silent skip to reduce log noise
                
        if not new_news:
            print("No new news items found (all duplicates).")
            return

        print(f"Proceeding with {len(new_news)} new items.")
        content = generate_blog_post(new_news)
        save_post(content)

        # Update History
        # We assume the LLM used most of the items, but to be safe we mark all 'new_news' as seen 
        # because we don't want to re-process them immediately even if LLM skipped one.
        # Ideally, we would parse the output to see what was used, but that's complex.
        # Marking all candidates provided to LLM as "processed" is safer to avoid endless loops.
        
        # Use KST for recording date
        kst = datetime.timezone(datetime.timedelta(hours=9))
        today_str = datetime.datetime.now(kst).strftime('%Y-%m-%d')
        
        if not isinstance(history_items, list):
            history_items = []
            
        for item in new_news:
            history_items.append({
                'title': item['title'],
                'link': item['link'],
                'date': today_str
            })
            
        save_history(history_items)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)

if __name__ == "__main__":
    main()
