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

# 본문에서 추출할 태그 개수 (대략)
TAGS_TARGET_COUNT = 20

TAGS_EXTRACTION_PROMPT = """아래는 마크다운 형식의 블로그 글 전체입니다.

이 글의 **본문에 실제로 나오는 내용**을 바탕으로 Jekyll용 태그 목록을 만드세요.

규칙:
1. 태그는 **문장·구절이 아니라 명사형**만 사용하세요. (회사명, 제품/서비스명, 기술명, 인물명, 핵심 주제 명사 등)
2. **한 태그 안에서는 한글만** 쓰거나 **영문(숫자 포함)만** 쓰세요. **한 태그에 한글과 영문을 섞지 마세요.** (예: 금지 `AI-에이전트`)
3. 문장형 태그를 만들지 말고, 키워드형 단어로 분해하세요. 예: `Anthropic, ... AI 에이전트 ... Cowork` -> `anthropic`, `ai`, `agent`, `cowork`
   - **한글 태그**는 고유명사·브랜드·제품/기능명·핵심 기술명처럼 **의미가 큰 단어만** 쓰고, 조사·접속·일반 동작어(해결, 촉구, 신설 등)는 넣지 마세요.
4. **가능하면 태그 하나는 단어 1개**로 만드세요. **꼭 필요한 경우만** 같은 언어의 **2단어**를 **하이픈(-)**으로 연결하세요.
   - 영어: 최대 2단어 (예: `anthropic`, `cowork`, `claude-code`)
   - 한글: 최대 2어절 (예: `인공지능`, `생성형-인공지능`)
   - **3개 이상** 단어 조합 금지
   - `claude code`는 항상 `claude-code`로 표기
5. 태그에 쓴 단어(들)는 **본문 안에 실제로 등장**해야 합니다. 없는 말·동의어·요약 신조어를 만들지 마세요.
6. 개수는 **{min_n}개 이상 {max_n}개 이하**로 하세요.
7. 태그 하나는 **40자 이하**로 하세요.
8. JSON만 출력하세요. 형식: {{"tags": ["...", "..."]}}

글:
---
{article}
---
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


def _parse_tags_json(raw: str):
    """모델 응답에서 JSON 배열만 파싱합니다."""
    if not raw or not isinstance(raw, str):
        return []
    text = raw.strip()
    # ```json ... ``` 제거
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return []
    tags = data.get("tags") if isinstance(data, dict) else None
    if not isinstance(tags, list):
        return []
    out = []
    for t in tags:
        if isinstance(t, str):
            s = t.strip()
            if s:
                out.append(s)
    return out


def _tag_appears_in_content(tag: str, content: str) -> bool:
    """태그 문자열이 본문에 부분 문자열로 실제 존재하는지 확인 (영문은 대소문자 무시)."""
    if not tag or not content:
        return False
    if tag in content:
        return True
    # 영문 혼합 시 대소문자만 다른 경우
    lo_tag, lo_content = tag.lower(), content.lower()
    if lo_tag in lo_content:
        return True
    return False


def _dedupe_tags_preserve_order(tags: list) -> list:
    seen = set()
    out = []
    for t in tags:
        key = t.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(t.strip())
    return out


def _drop_redundant_compound_tags(tags: list) -> list:
    """예: claude-code가 있으면 claude, code 단독 태그 제거."""
    sset = set(t.lower() for t in tags)
    if "claude-code" in sset:
        return [t for t in tags if t.lower() not in {"claude", "code"}]
    return tags


def _is_korean_token(t: str) -> bool:
    return bool(t and re.fullmatch(r"[가-힣]{2,}", t))


def _is_english_token(t: str) -> bool:
    """브랜드/기술명용 영문·숫자 토큰 (최소 2글자, 단 AI는 예외)."""
    if not t:
        return False
    if t.lower() == "ai":
        return True
    if len(t) < 2:
        return False
    return bool(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9.]*", t))


def _scan_tag_tokens_in_order(s: str) -> list:
    """문자열에서 한글/영문 토큰을 앞에서 순서대로 스캔."""
    if not s or not isinstance(s, str):
        return []
    s = " ".join(s.split())
    s = s.strip()
    s = re.sub(r'^[\"\'""„«»`´＂]+|[\"\'""„«»`´＂]+$', "", s)
    s = re.sub(r"[,，、;；]", " ", s)
    s = re.sub(r"#+\s*", "", s)
    s = " ".join(s.split())
    s = s.strip(" ·|")
    if not s:
        return []
    toks = []
    for m in re.finditer(r"[가-힣]{2,}|[A-Za-z][A-Za-z0-9.]*", s):
        t = m.group(0)
        if re.fullmatch(r"\d+", t):
            continue
        toks.append(t)
    return toks


def _is_valid_noun_tag_shape(tag: str) -> bool:
    """하이픈으로 구분된 **단어(어절)는 최대 2개** (내부 하이픈 없이 단순 분할)."""
    if not tag or not isinstance(tag, str):
        return False
    parts = [p for p in tag.split("-") if p]
    if not parts or len(parts) > 2:
        return False
    return all(len(p) >= 1 for p in parts)


def _is_monolingual_tag(tag: str) -> bool:
    """한 태그 안에 한글과 영문이 섞이지 않음 (각 하이픈 구간도 단일 스크립트)."""
    if not tag or not isinstance(tag, str):
        return False
    parts = [p for p in tag.split("-") if p]
    if not parts:
        return False
    scripts = set()
    for p in parts:
        if re.fullmatch(r"[가-힣]+", p):
            scripts.add("ko")
        elif re.fullmatch(r"[A-Za-z0-9.]+", p):
            scripts.add("en")
        else:
            return False
    return len(scripts) <= 1


EN_STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out",
    "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old", "see", "two", "way",
    "who", "boy", "did", "let", "put", "say", "she", "too", "use", "with", "from", "this", "that",
    "have", "been", "will", "your", "more", "some", "what", "when", "than", "them", "into", "also",
    "http", "https", "www", "com", "org", "src", "alt", "summary", "source", "why", "matters",
    "answer", "arms", "race", "article", "weekly", "discover", "prompted", "playlists", "technology",
    "launches", "works", "desktop", "venturebeat", "techcrunch", "verge", "wired", "reuters",
    "guy", "behind", "data", "center", "promote", "testing", "reportedly", "rumors", "swirl",
    "tech", "tests", "test", "tracking", "track", "software", "chip", "chips", "smuggling",
    "file", "files", "rolls", "roll", "battles", "battle", "native", "legacy", "works",
    "based", "powered", "personalized", "more", "select", "publications", "pages",
    "founds", "foundation", "donates", "overviews", "secures", "million", "challenge",
    "news",
    "amin", "vahdat", "chief", "technologist", "officer", "president", "founder",
    "block", "costs", "cost",
    "googles", "attorneys", "attorney", "state", "general", "generals",
    "denise", "dresser", "confirms", "massive", "seed", "round", "unconventional",
    "military", "platform",
    "defends", "circular", "deals", "working", "together", "appoints", "naveen",
    "theverge", "linux",
    "market", "research",
}

# 영문 태그: 4글자 미만은 여기 있을 때만 허용 (브랜드/약어)
EN_TAG_SHORT_WHITELIST = frozenset(
    {"ai", "aws", "api", "cto", "gpt", "llm", "gpu", "cpu", "ml", "ui", "ux", "ar", "vr", "io"}
)

EN_TAG_BLOCKLIST = frozenset(
    """
    answer arms article weekly discover prompted playlists technology launches works desktop
    venturebeat techcrunch goose
    """.split()
)

KO_TECH_TO_EN = {
    "인공지능": "ai",
    "에이전트": "agent",
    "클로드": "claude",
    "코드": "code",
    "코워크": "cowork",
}

KO_SUFFIXES = (
    "으로", "에서", "에게", "한테", "까지", "부터", "처럼", "보다",
    "은", "는", "이", "가", "을", "를", "의", "에", "와", "과", "도", "만", "로",
    "하며", "하고", "하는", "한다", "했다", "되며", "되고", "되는", "된다",
    "하여", "받으며", "이며", "라며",
)

# 한글 태그로 쓰기 부적절한 일반어·절·동작 표현 (문장을 쪼갤 때 나오는 잡음 제거)
KO_TAG_BLOCKLIST = frozenset(
    """
    이번 오늘 하루 내일 어제 지금 현재 최근 당시 동안 동안에 동안의
    소식 기사 뉴스 정리 요약 관련 대해 통해 위한 위해서 중심 기반 경우 내용
    방식 차원 측면 부분 전체 일부 수준 정도 만큼 정도로
    그리고 그러나 하지만 또한 또는 및 등 또 다시 역시 특히
    가장 매우 아주 정말 너무 좀 더 많이 조금
    단순 새로운 기존 직접 간접 빠르게 천천히
    출시 발표 진행 제공 확대 축소 강화 약화
    가능 가능한 불가능 중요 중요한 필요 필요한
    일반 사용자 사람들 사람 모두 각각
    최고 거대 대형 소형 신규 구형
    기술 책임자 신설 해결 촉구 추적 출력 테스트 기능
    속에 위에 아래 앞에 뒤에 사이
    국내 해외
    기업 회사 업체 당국 정부 기관
    법무장관 법무장관들 주정부
    강력한 전면 개편 달러 투자 유치하며 도전장
    다이제스트
    """.split()
)

# 2~3글자라도 태그로 허용할 고유명사·핵심 단어 (그 외 2~3글자 한글은 태그에서 제외)
KO_TAG_SHORT_WHITELIST = frozenset(
    """
    구글 애플 메타 네이버 다음 카카오 테슬라
    엔비디아 스포티파이 오픈AI 앤스로픽
    환각 밀수 논란 칩 슬랙봇
    미국 한국 유럽 아시아 글로벌
    인프라
    """.split()
)

# 7글자 이상 한글(긴 붙여쓰기): 화이트에 있을 때만 태그로 허용 (직함·문장 덩어리 배제)
KO_TAG_LONG_WHITELIST = frozenset(
    """
    마이크로소프트 프롬프트플레이리스트
    """.split()
)

# 직함·조직·절차 등 문장에서 떼어진 덩어리로 자주 나오는 접미/형태 — 태그로 부적합
KO_TAG_REJECT_SUFFIXES = (
    "책임자",
    "담당자",
    "총괄",
    "위원장",
    "위원회",
    "협의회",
    "대변인",
    "장관",
    "대통령",
    "부장",
    "팀장",
    "실장",
    "본부장",
    "사장",
    "대표",
    "이사",
    "임원",
    "수행",
    "추진",
    "검토",
    "협력",
    "논의",
    "발표",
    "진행",
    "확인",
    "유치",
    "지원",
    "촉구",
    "요구",
    "해결",
    "대응",
    "도입",
    "적용",
    "개발",
    "구축",
    "운영",
    "관리",
    "분석",
    "평가",
    "검증",
    "테스트",
    "보도",
    "전망",
    "예정",
    "계획",
    "방침",
    "방안",
    "조치",
    "대책",
    "논란",
)


def _is_substantive_korean_tag(word: str) -> bool:
    """
    한글 태그: 고유명사·브랜드·핵심 기술명 위주 (문장을 어절 단위로 쪼갠 잡음 제외).
    - 2~3글자: KO_TAG_SHORT_WHITELIST에 있을 때만
    - 4~6글자: 블록·접미 규칙 통과 시 (직함/동작 접미로 끝나면 제외)
    - 7글자 이상: KO_TAG_LONG_WHITELIST에 있을 때만
    """
    if not word or not isinstance(word, str):
        return False
    if not re.fullmatch(r"[가-힣]+", word):
        return False
    if word in KO_TAG_BLOCKLIST:
        return False
    n = len(word)
    if n <= 3:
        return word in KO_TAG_SHORT_WHITELIST
    if n >= 7:
        return word in KO_TAG_LONG_WHITELIST
    # 4~6글자: 직함/절차형 접미로 끝나면 제외 (예: 최고수익책임자 → …책임자)
    for suf in KO_TAG_REJECT_SUFFIXES:
        if len(suf) < n and word.endswith(suf):
            return False
    return True


PREFERRED_HYPHEN_PAIRS = [
    ("claude", "code"),
]


def _normalize_english_token(token: str) -> str | None:
    if not token:
        return None
    t = token.strip().strip(".").lower()
    if not _is_english_token(t):
        return None
    if t.endswith(".md") or "/" in t or "." in t:
        return None
    if re.search(r"\d", t):
        return None
    if t in EN_TAG_BLOCKLIST or t in EN_STOPWORDS:
        return None
    if len(t) < 4 and t not in EN_TAG_SHORT_WHITELIST:
        return None
    return t


def _korean_keyword_boundary_ok(tag: str, content: str) -> bool:
    """
    본문에 tag가 등장할 때, 더 긴 한글 단어의 앞절만 짤려 매칭된 경우(False)를 배제합니다.
    (예: '스포티파' in '스포티파이')
    """
    if not tag or not content or not re.fullmatch(r"[가-힣]+", tag):
        return _tag_appears_in_content_for_normalized(tag, content)
    for m in re.finditer(re.escape(tag), content):
        end = m.end()
        if end < len(content) and "\uac00" <= content[end] <= "\ud7a3":
            continue
        start = m.start()
        if start > 0 and "\uac00" <= content[start - 1] <= "\ud7a3":
            continue
        return True
    return False


def _normalize_korean_token(token: str) -> str | None:
    if not token or not _is_korean_token(token):
        return None
    t = token
    for suf in KO_SUFFIXES:
        if t.endswith(suf) and len(t) - len(suf) >= 2:
            t = t[: -len(suf)]
            break
    if len(t) < 2:
        return None
    return t


def _extract_tags_from_raw_candidate(raw: str, content: str) -> list:
    """
    문장형 후보를 키워드 태그로 분해:
    - 영어 단어는 소문자 단일 키워드로 추출
    - 특정 2단어 조합(예: claude code)은 하이픈 태그로 변환
    - 한글은 1~2어절(하이픈)만 허용
    """
    if not raw or not isinstance(raw, str):
        return []
    raw = " ".join(raw.split())

    tokens = _scan_tag_tokens_in_order(raw)
    if not tokens:
        return []

    out = []

    # 1) 영어 하이픈 우선 태그 (예: claude-code)
    lowered = [t.lower() for t in tokens if _is_english_token(t)]
    for a, b in PREFERRED_HYPHEN_PAIRS:
        for i in range(len(lowered) - 1):
            if lowered[i] == a and lowered[i + 1] == b:
                tag = f"{a}-{b}"
                if _tag_appears_in_content_for_normalized(tag, content):
                    out.append(tag)

    # 2) 영어 단일 키워드
    for t in tokens:
        norm = _normalize_english_token(t)
        if not norm:
            continue
        if norm in {"claude", "code"} and "claude-code" in out:
            continue
        if _tag_appears_in_content_for_normalized(norm, content):
            out.append(norm)

    # 3) 한글 키워드 (가능하면 1어절 우선)
    ko_tokens = [t for t in tokens if _is_korean_token(t)]
    norm_ko_tokens = []
    for t in ko_tokens:
        norm_ko = _normalize_korean_token(t)
        if not norm_ko:
            continue
        norm_ko_tokens.append(norm_ko)
        mapped_en = KO_TECH_TO_EN.get(norm_ko)
        if mapped_en and _tag_appears_in_content_for_normalized(mapped_en, content):
            out.append(mapped_en)
        elif _is_substantive_korean_tag(norm_ko) and _korean_keyword_boundary_ok(
            norm_ko, content
        ):
            out.append(norm_ko)

    for i in range(len(norm_ko_tokens) - 1):
        a = KO_TECH_TO_EN.get(norm_ko_tokens[i])
        b = KO_TECH_TO_EN.get(norm_ko_tokens[i + 1])
        if a and b:
            pair = f"{a}-{b}"
            if pair in {"claude-code"} and _tag_appears_in_content_for_normalized(pair, content):
                out.append(pair)

    # 규칙 정리
    cleaned = []
    for tag in out:
        if len(tag) > 40:
            continue
        if not _is_valid_noun_tag_shape(tag):
            continue
        if not _is_monolingual_tag(tag):
            continue
        cleaned.append(tag)

    return _dedupe_tags_preserve_order(cleaned)


def _tag_appears_in_content_for_normalized(tag: str, content: str) -> bool:
    """정규화된 태그가 본문에 존재하는지 (하이픈↔공백, 이원 분해 완화 포함)."""
    if not tag or not content:
        return False
    if tag in content:
        return True
    lo_tag, lo_content = tag.lower(), content.lower()
    if lo_tag in lo_content:
        return True
    if "-" in tag:
        spaced = tag.replace("-", " ")
        if spaced in content:
            return True
        if spaced.lower() in lo_content:
            return True
        parts = tag.split("-", 1)
        if len(parts) == 2 and parts[0] and parts[1]:
            if parts[0] in content and parts[1] in content:
                return True
            if parts[0].lower() in lo_content and parts[1].lower() in lo_content:
                return True
    return False


def _finalize_noun_hyphen_tags(raw_tags: list, content: str) -> list:
    """후보 태그를 키워드형 태그로 분해/정규화."""
    out = []
    for t in raw_tags:
        if not isinstance(t, str):
            continue
        if len(t) > 200:
            continue
        t = " ".join(t.split())
        if not t or t.startswith("##") or ">" in t:
            continue
        out.extend(_extract_tags_from_raw_candidate(t, content))
    return _dedupe_tags_preserve_order(out)


def _fallback_tags_from_markdown(content: str, limit: int) -> list:
    """
    LLM 실패 시: ## / # 제목, **볼드**, 인용·링크 텍스트, 영문 토큰에서 후보를 모읍니다.
    (한글은 짧은 형태소 단위 스캔을 하지 않아 태그 품질을 유지합니다.)
    """
    candidates = []

    for m in re.finditer(r"^##\s*\d+\.\s*(.+)$", content, re.MULTILINE):
        line = m.group(1).strip()
        if 2 <= len(line) <= 100:
            candidates.append(line)

    for m in re.finditer(r"^#\s+(.+)$", content, re.MULTILINE):
        line = m.group(1).strip()
        if 2 <= len(line) <= 100 and not line.startswith("#"):
            candidates.append(line)

    for m in re.finditer(r"\*\*([^*]{2,120})\*\*", content):
        inner = m.group(1).strip()
        if inner.endswith(":"):
            inner = inner[:-1].strip()
        if inner.lower() in ("summary", "why it matters", "source"):
            continue
        if inner in ("Summary", "Why it matters", "Source"):
            continue
        if re.fullmatch(r"\d+개의 기사", inner):
            continue
        if 2 <= len(inner) <= 100:
            candidates.append(inner)

    # 작은따옴표/큰따옴표로 감싼 구 (제품명 등)
    for m in re.finditer(r"[''\"]([A-Za-z0-9][A-Za-z0-9\s\.\-]{1,38})[''\"]", content):
        q = m.group(1).strip()
        if len(q) >= 2:
            candidates.append(q)

    # 마크다운 링크 텍스트 [ ... ](url)
    for m in re.finditer(r"\[([^\]]{2,100})\]\(\s*https?://", content):
        lt = m.group(1).strip()
        if not lt.lower().startswith("link to article"):
            candidates.append(lt)

    # 영문 기술 단어 후보
    stop = {
        "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out",
        "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old", "see", "two", "way",
        "who", "boy", "did", "let", "put", "say", "she", "too", "use", "with", "from", "this", "that",
        "have", "been", "will", "your", "more", "some", "what", "when", "than", "them", "into", "also",
        "http", "https", "www", "com", "org", "src", "alt",
    }
    for m in re.finditer(r"\b[A-Za-z][A-Za-z0-9\-]{1,}\b", content):
        w = m.group(0)
        if w.lower() in stop or len(w) < 3:
            continue
        candidates.append(w)

    candidates = _dedupe_tags_preserve_order(candidates)
    # 길이·중복 재정렬: 긴 한글 제목 우선 유지
    return candidates[:limit]


def generate_tags_from_post_content(content: str) -> list:
    """
    본문 기반으로 약 TAGS_TARGET_COUNT개의 태그를 생성합니다.
    우선 LLM으로 '본문에 실제 등장하는 표현'만 고르도록 요청하고, 검증 후 부족하면 휴리스틱으로 보완합니다.
    """
    min_n = max(15, TAGS_TARGET_COUNT - 2)
    max_n = TAGS_TARGET_COUNT + 2
    article = content if len(content) <= 20000 else content[:20000]
    prompt = TAGS_EXTRACTION_PROMPT.format(min_n=min_n, max_n=max_n, article=article)

    tags = []
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            models_to_try = [
                "gemini-flash-latest",
                "gemini-pro-latest",
                "gemini-1.5-flash",
                "gemini-1.5-flash-latest",
                "gemini-1.5-pro",
            ]
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    raw = response.text or ""
                    tags = _parse_tags_json(raw)
                    if tags:
                        print(f"Tags extracted with {model_name}: {len(tags)} candidates")
                        break
                except Exception as e:
                    print(f"Tag extraction failed with {model_name}: {e}")
                    continue
        except Exception as e:
            print(f"Tag extraction (Gemini) error: {e}")

    if not tags and openai_key:
        try:
            client = OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You output only valid JSON."},
                    {"role": "user", "content": prompt},
                ],
            )
            raw = response.choices[0].message.content or ""
            tags = _parse_tags_json(raw)
            if tags:
                print(f"Tags extracted with OpenAI: {len(tags)} candidates")
        except Exception as e:
            print(f"Tag extraction (OpenAI) error: {e}")

    # 명사형·최대 2단어·하이픈 규칙으로 정규화 + 본문 일치
    verified = _finalize_noun_hyphen_tags(tags, content)

    # LLM이 아예 응답하지 않았을 때만 휴리스틱으로 개수 보강
    # (일부만 검증 통과한 경우 저품질 폴백이 섞이는 것을 방지)
    if len(verified) < min_n and not tags:
        fallback_raw = _fallback_tags_from_markdown(content, max_n * 4)
        extra = _finalize_noun_hyphen_tags(fallback_raw, content)
        for e in extra:
            if e not in verified:
                verified.append(e)
            if len(verified) >= max_n:
                break
        verified = _dedupe_tags_preserve_order(verified)

    verified = _filter_noise_tags(verified, content)

    # 형태 규칙 최종 확인 (필터 후에도 이중 검사)
    verified = [t for t in verified if _is_valid_noun_tag_shape(t)]
    # 본문에 AI 맥락이 있으면 ai 태그를 기본 포함
    if ("ai" in content.lower() or "인공지능" in content) and "ai" not in [v.lower() for v in verified]:
        verified.insert(0, "ai")
    verified = _dedupe_tags_preserve_order(verified)
    verified = _drop_redundant_compound_tags(verified)
    verified = _dedupe_tags_preserve_order(verified)

    # 목표 개수에 맞게 자르기/패딩은 하지 않음 (부족하면 그대로)
    if len(verified) > max_n:
        verified = verified[:max_n]

    if not verified:
        verified = ["daily-news", "ai", "news"]

    print(f"Final tag count: {len(verified)}")
    return verified


# 최종 태그에서 제거할 저품질 패턴 (영문 단독·메타 단어 등)
_TAG_NOISE_EN = frozenset(
    """
    summary source why matters the and for are but not you all can was one our out
    how its may new now old see two way who did let put say she too use with from this that
    have been will your more some what when than them into also link href index com org
    read click here there these those they them very just only both each few such same
    than then well also back over after first last next most other another
    """.split()
)

_TAG_NOISE_KO = frozenset(
    """
    이번 오늘 하루 소식 기사 정리 요약 관련 대해 통해 위한 중심 기반 경우 내용
    그리고 그러나 또한 또한의 가장 매우 정말 단순 새로운 기존 출시 발표 진행 제공
    """.split()
)


def _filter_noise_tags(tags: list, content: str | None = None) -> list:
    out = []
    for t in tags:
        if not isinstance(t, str):
            continue
        s = t.strip()
        if not s or len(s) > 120:
            continue
        if re.search(r"\s", s):
            continue
        if not _is_valid_noun_tag_shape(s):
            continue
        if re.match(r"https?://", s, re.I):
            continue
        if re.fullmatch(r"[A-Za-z]{1,2}", s) and s.lower() != "ai":
            continue
        if s.lower() in _TAG_NOISE_EN and len(s) <= 12:
            continue
        if s in _TAG_NOISE_KO:
            continue
        # digest 배지 등 메타 문구
        if re.fullmatch(r"\d+개의 기사", s):
            continue
        if re.fullmatch(r"[가-힣]+", s):
            if not _is_substantive_korean_tag(s):
                continue
            if content and not _korean_keyword_boundary_ok(s, content):
                continue
        elif re.fullmatch(r"[가-힣]+-[가-힣]+", s):
            a, b = s.split("-", 1)
            if not (
                _is_substantive_korean_tag(a)
                and _is_substantive_korean_tag(b)
            ):
                continue
            if content and (
                not _korean_keyword_boundary_ok(a, content)
                or not _korean_keyword_boundary_ok(b, content)
            ):
                continue
        out.append(s)
    return _dedupe_tags_preserve_order(out)


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

    # 본문에서 실제 등장 단어·구 기준으로 태그 약 TAGS_TARGET_COUNT개 생성
    post_tags = generate_tags_from_post_content(content_with_badge)

    # Create front matter (제목에 중복 시 접미사만 추가)
    front_matter = {
        'layout': 'post',
        'title': f"{display_title}{title_suffix}",
        'date': now_kst.strftime('%Y-%m-%d %H:%M:%S %z'),
        'categories': ['news', 'ai'],
        'tags': post_tags
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
