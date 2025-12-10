import os
import datetime
import feedparser
import google.generativeai as genai
from openai import OpenAI
import time
import yaml

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
4. For each story, provide a clear title, a summary of what happened, and why it matters.
5. Use proper Markdown formatting.
6. Include the source link for each story.

Here is the news data:
{news_data}

Return only the Markdown content for the blog post (excluding front matter).
"""

def fetch_news():
    news_items = []
    print("Fetching news from RSS feeds...")
    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
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
        print("Using Google Gemini...")
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        content = response.text
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
    date_str = datetime.datetime.now().strftime('%Y-%m-%d')
    filename = f"{date_str}-daily-ai-news.md"
    filepath = os.path.join("_posts/news", filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    # Create front matter
    front_matter = {
        'layout': 'post',
        'title': f"{date_str} Daily AI & Tech News",
        'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S %z'),
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
            print("No news found.")
            return

        print(f"Collected {len(news)} news candidates.")
        content = generate_blog_post(news)
        save_post(content)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)

if __name__ == "__main__":
    main()
