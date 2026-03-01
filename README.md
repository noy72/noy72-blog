# noy72-blog

Astro + TypeScript + Tailwind CSS を使用した個人ブログサイト

## 歴史

- [自前のブログを作った | noy72.com](https://noy72.com/articles/2021-02-01-vercel)
- [サイトをまるっと置き換えた | noy72.com](https://noy72.com/articles/2024-12-29-replace)
- [ブログをGatsbyからAstroに移行した | noy72.com](https://noy72.com/articles/2026-03-01-blog-migration-to-astro)

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

### description の自動生成

`description` は省略可能。省略した場合、記事カード (一覧ページ・タグページ) では本文の最初の文 (`.。!?！？` で終わる部分) が自動的に表示される。文末記号がない場合は最初の行が使われる。

SEO 用の `<meta name="description">` (記事詳細ページ) では、本文の先頭 150 文字が使われる。

`description` を明示指定した場合はそちらが優先される。
