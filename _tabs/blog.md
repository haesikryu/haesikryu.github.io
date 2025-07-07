---
title: Blog
icon: fas fa-pen
order: 1
---

<p class="lead">
  소프트웨어 개발, 아키텍처, AI, 트렌드 등 다양한 주제의 글을 공유합니다. 경험과 인사이트를 기록하는 공간입니다.
</p>

<ul>
{% for post in site.posts %}
  {% if post.categories contains "Blog" %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span style="color:#888; font-size:0.9em;">({{ post.date | date: "%Y-%m-%d" }})</span>
    </li>
  {% endif %}
{% endfor %}
</ul> 