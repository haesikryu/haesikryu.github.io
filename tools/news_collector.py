import feedparser
import datetime
import hashlib
import os
import yaml
from bs4 import BeautifulSoup
import re
from typing import List, Dict
from dataclasses import dataclass
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag
import time

@dataclass
class NewsItem:
    title: str
    content: str
    link: str
    published_date: datetime.datetime
    source: str
    categories: List[str]
    tags: List[str]

class NewsCollector:
    def __init__(self):
        self.sources = {
            'techcrunch': {
                'url': 'https://techcrunch.com/feed/',
                'category': 'Technology'
            },
            'zdnet': {
                'url': 'https://www.zdnet.com/news/rss.xml',
                'category': 'Technology'
            },
            'developer-news': {
                'url': 'https://news.developer.amazon.com/feed',
                'category': 'Development'
            }
        }
        
        # Download required NLTK data
        nltk.download('punkt')
        nltk.download('averaged_perceptron_tagger')
        nltk.download('stopwords')
        
        self.posts_dir = '_posts'
        self.processed_hashes_file = 'tools/.processed_news_hashes'
        self.processed_hashes = self._load_processed_hashes()

    def _load_processed_hashes(self) -> set:
        if os.path.exists(self.processed_hashes_file):
            with open(self.processed_hashes_file, 'r') as f:
                return set(f.read().splitlines())
        return set()

    def _save_processed_hash(self, content_hash: str):
        with open(self.processed_hashes_file, 'a') as f:
            f.write(f"{content_hash}\n")

    def _extract_keywords(self, text: str) -> List[str]:
        # Tokenize and tag parts of speech
        tokens = word_tokenize(text.lower())
        tagged = pos_tag(tokens)
        
        # Get English stop words
        stop_words = set(stopwords.words('english'))
        
        # Extract nouns and meaningful words
        keywords = []
        for word, pos in tagged:
            if (pos.startswith('NN') and  # Nouns
                word not in stop_words and
                len(word) > 2):
                keywords.append(word)
        
        return list(set(keywords))[:5]  # Return top 5 unique keywords

    def _clean_html_content(self, html_content: str) -> str:
        soup = BeautifulSoup(html_content, 'html.parser')
        text = soup.get_text()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Add proper quote attribution
        text += f"\n\nSource: {entry.link}"
        return text

    def _create_post_filename(self, date: datetime.datetime, title: str) -> str:
        # Clean title for filename
        clean_title = re.sub(r'[^a-zA-Z0-9\s-]', '', title).lower()
        clean_title = re.sub(r'\s+', '-', clean_title)
        return f"{date.strftime('%Y-%m-%d')}-{clean_title[:50]}.md"

    def _generate_front_matter(self, item: NewsItem) -> str:
        front_matter = {
            'title': item.title,
            'date': item.published_date.strftime('%Y-%m-%d %H:%M:%S %z'),
            'categories': item.categories,
            'tags': item.tags,
            'source_url': item.link,
            'source_name': item.source,
            'layout': 'post',
            'author': 'news-bot'
        }
        return f"---\n{yaml.dump(front_matter, allow_unicode=True)}---\n\n"

    def collect_and_save_news(self):
        for source_name, source_info in self.sources.items():
            feed = feedparser.parse(source_info['url'])
            
            for entry in feed.entries:
                # Create hash of content to check for duplicates
                content_hash = hashlib.md5(
                    f"{entry.title}{entry.link}".encode()
                ).hexdigest()
                
                if content_hash in self.processed_hashes:
                    continue
                
                # Parse date
                published = datetime.datetime.fromtimestamp(
                    time.mktime(entry.published_parsed)
                )
                
                # Clean content
                content = self._clean_html_content(
                    entry.get('content', [{'value': ''}])[0]['value']
                )
                
                # Extract keywords for tags
                keywords = self._extract_keywords(
                    f"{entry.title} {content}"
                )
                
                news_item = NewsItem(
                    title=entry.title,
                    content=content,
                    link=entry.link,
                    published_date=published,
                    source=source_name,
                    categories=[source_info['category']],
                    tags=keywords
                )
                
                # Generate post content
                post_content = (
                    self._generate_front_matter(news_item) +
                    news_item.content
                )
                
                # Save post
                filename = self._create_post_filename(
                    news_item.published_date,
                    news_item.title
                )
                filepath = os.path.join(self.posts_dir, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(post_content)
                
                # Mark as processed
                self._save_processed_hash(content_hash)

if __name__ == '__main__':
    collector = NewsCollector()
    collector.collect_and_save_news() 