---
title: Blog
icon: fas fa-pen
order: 1
---

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