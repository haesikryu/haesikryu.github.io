#!/usr/bin/env python3
"""
뉴스 포스트의 front matter title을 본문 첫 기사 제목 + " 등 N개 기사" 형식으로 일괄 수정합니다.
파일명은 변경하지 않습니다.
"""
import os
import re

NEWS_DIR = os.path.join(os.path.dirname(__file__), "..", "_posts", "news")


def extract_first_title_and_count(content):
    """본문에서 첫 번째 ## 1. 제목과 기사 개수를 반환. (first_title, count)"""
    if not content or not isinstance(content, str):
        return None, 0
    first = re.search(r"^##\s*1\.\s*(.+?)(?:\n|$)", content.strip(), re.MULTILINE)
    if not first:
        return None, 0
    title = first.group(1).strip()
    matches = re.findall(r"^##\s*\d+\.\s", content.strip(), re.MULTILINE)
    return title if title else None, len(matches)


def update_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()
    if not raw.startswith("---"):
        return False, "no front matter"
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return False, "invalid front matter"
    fm_str, body = parts[1], parts[2]
    first_title, count = extract_first_title_and_count(body)
    if not first_title or count <= 0:
        return False, "no ## 1. or count"
    new_title = f"{first_title} 등 {count}개 기사"
    # title: ... 줄만 교체 (값은 쌍따옴표로 감싸서 YAML 파싱 안전하게)
    escaped = new_title.replace("\\", "\\\\").replace('"', '\\"')
    new_title_line = f'title: "{escaped}"'
    title_re = re.compile(r"^title:\s*.+$", re.MULTILINE)
    if not title_re.search(fm_str):
        return False, "no title line"
    new_fm_str = title_re.sub(new_title_line, fm_str, count=1)
    if new_fm_str == fm_str:
        return True, "unchanged"
    new_content = "---" + new_fm_str + "---" + body
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True, new_title


def main():
    updated = 0
    skipped = 0
    for name in sorted(os.listdir(NEWS_DIR)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(NEWS_DIR, name)
        ok, msg = update_file(path)
        if ok:
            if msg != "unchanged":
                updated += 1
                print(f"OK {name}: {msg[:60]}...")
        else:
            skipped += 1
            print(f"SKIP {name}: {msg}")
    print(f"\nUpdated: {updated}, Skipped: {skipped}")


if __name__ == "__main__":
    main()
