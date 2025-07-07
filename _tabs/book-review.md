---
title: Book Review
icon: fas fa-book
order: 2
---

<p class="lead">
개발 서적과 기술 도서에 대한 리뷰를 공유하는 공간입니다. 읽은 책에 대한 인사이트와 배운 점을 기록합니다.
</p>

<ul>
{% for post in site.posts %}
  {% if post.categories contains "Book Review" %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span style="color:#888; font-size:0.9em;">({{ post.date | date: "%Y-%m-%d" }})</span>
    </li>
  {% endif %}
{% endfor %}
</ul> 