---
title: TECH NEWS
icon: fas fa-newspaper
order: 2
---

<p class="lead">
  최신 IT 및 AI 뉴스를 정리하여 공유합니다.
</p>

<ul>
{% for post in site.posts %}
  {% if post.categories contains "news" %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span style="color:#888; font-size:0.9em;">({{ post.date | date: "%Y-%m-%d" }})</span>
    </li>
  {% endif %}
{% endfor %}
</ul>
