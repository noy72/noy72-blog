# noy72-blog

Astro + TypeScript + Tailwind CSS を使用した個人ブログサイト

## 技術スタック

- Astro 5.x
- Tailwind CSS 4.x

## 記事の追加方法

1. `src/data/articles/` に新しいマークダウンファイルを作成
2. ファイル名は `YYYY-MM-DD_slug.md` 形式で命名
3. frontmatterに必要な情報を記述

```md
---
title: "記事のタイトル"
description: "記事の説明"
tags: ["tag1", "tag2"]
draft: false
thumbnail: "https://example.com/image.jpg"
---

記事の本文をここに書く
```
