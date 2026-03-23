#!/usr/bin/env python3
"""
기존 _posts/news/*.md 글의 front matter `tags`만 daily_news.py의 정책과 동일하게 재생성합니다.
(title·date 등 다른 메타데이터는 원문 그대로 유지)

- 태그는 **명사형**, **한글만 또는 영어만**(한 태그에 한·영 혼합 금지), **각 언어당 단어 1~2개**(가능하면 1개, 2개면 하이픈) 규칙을 따릅니다 (`tools/daily_news.py` 참고).
- GEMINI_API_KEY 또는 OPENAI_API_KEY가 있으면 LLM으로 본문 기반 태그(약 20개) 추출
- 없으면 daily_news.py와 동일한 휴리스틱 폴백만 사용 (품질은 LLM 사용 시보다 낮을 수 있음)

사용 예:
  cd <저장소 루트>
  export GEMINI_API_KEY=...   # 권장
  python3 tools/retag_news_posts.py
  python3 tools/retag_news_posts.py --dry-run --max 3
"""
from __future__ import annotations

import argparse
import glob
import os
import re
import sys
import time

import yaml

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, SCRIPT_DIR)

from daily_news import generate_tags_from_post_content  # noqa: E402

# front matter 내 tags: 블록 (리스트 형태만 지원)
_TAGS_BLOCK_RE = re.compile(
    r"^tags:\s*\n(?:[ \t]*-\s[^\n]+\n)+",
    re.MULTILINE,
)


def split_front_matter(text: str) -> tuple[str, str] | tuple[None, None]:
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return None, None
    fm_lines: list[str] = []
    i = 1
    while i < len(lines):
        if lines[i].strip() == "---":
            break
        fm_lines.append(lines[i])
        i += 1
    else:
        return None, None
    body = "".join(lines[i + 1 :])
    return "".join(fm_lines), body


def replace_tags_in_file_text(full_text: str, new_tags: list) -> str:
    """전체 파일 문자열에서 tags: 블록만 교체합니다."""
    new_block = (
        yaml.dump(
            {"tags": new_tags},
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=1000,
        ).rstrip()
        + "\n"
    )
    m = _TAGS_BLOCK_RE.search(full_text)
    if not m:
        raise ValueError("tags: 리스트 블록을 찾을 수 없음")
    return full_text[: m.start()] + new_block + full_text[m.end() :]


def process_file(path: str, dry_run: bool) -> tuple[bool, str]:
    with open(path, "r", encoding="utf-8") as f:
        original = f.read()
    fm_raw, body = split_front_matter(original)
    if fm_raw is None or body is None:
        return False, "front matter 없음 또는 형식 오류"

    try:
        fm = yaml.safe_load(fm_raw) or {}
    except yaml.YAMLError as e:
        return False, f"YAML 파싱 실패: {e}"

    if not isinstance(fm, dict):
        return False, "front matter가 객체가 아님"

    old_tags = fm.get("tags")
    if not isinstance(old_tags, list):
        return False, "tags가 리스트가 아님"

    new_tags = generate_tags_from_post_content(body)
    if old_tags == new_tags:
        return True, "변경 없음"

    try:
        new_text = replace_tags_in_file_text(original, new_tags)
    except ValueError as e:
        return False, str(e)

    if dry_run:
        return True, f"[dry-run] tags {len(old_tags)} -> {len(new_tags)}"

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_text)
    return True, f"tags {len(old_tags)} -> {len(new_tags)}"


def main() -> int:
    parser = argparse.ArgumentParser(description="news 포스트 tags 일괄 재생성")
    parser.add_argument("--dry-run", action="store_true", help="파일 쓰기 없이 시뮬레이션")
    parser.add_argument("--max", type=int, default=0, help="처리할 최대 파일 수 (0=전체)")
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help="파일마다 대기(초). API 호출 시 rate limit 완화용",
    )
    args = parser.parse_args()

    pattern = os.path.join(REPO_ROOT, "_posts", "news", "*.md")
    paths = sorted(glob.glob(pattern))
    if args.max > 0:
        paths = paths[: args.max]

    if not paths:
        print(f"대상 없음: {pattern}")
        return 1

    ok = 0
    skip = 0
    err = 0
    for i, p in enumerate(paths):
        rel = os.path.relpath(p, REPO_ROOT)
        try:
            success, msg = process_file(p, args.dry_run)
            if success:
                if "변경 없음" in msg:
                    skip += 1
                else:
                    ok += 1
                print(f"[{i + 1}/{len(paths)}] {rel}: {msg}")
            else:
                err += 1
                print(f"[{i + 1}/{len(paths)}] {rel}: ERROR {msg}", file=sys.stderr)
        except Exception as e:
            err += 1
            print(f"[{i + 1}/{len(paths)}] {rel}: EXC {e}", file=sys.stderr)
        if args.delay > 0 and i + 1 < len(paths):
            time.sleep(args.delay)

    print(f"\n완료: 갱신 {ok}, 변경없음 {skip}, 오류 {err}, 대상 {len(paths)}")
    return 0 if err == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
