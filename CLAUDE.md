# CLAUDE.md

## プロジェクト概要

Astro + TypeScript + Tailwind CSS を使用した静的な個人ブログサイト。Astro Content Collections を使って記事を管理し、pnpm でパッケージを管理している。

Astro を使った静的サイトのため、開発環境/本番環境が一般的な Web アプリケーションとは異なる。

## 開発環境

### パッケージマネージャー

すべてのコマンドは pnpm で実行すること (npm ではない)。

### 開発コマンド

コマンドは @package.json を参照。

## アーキテクチャ

### Content Collections による記事管理

記事は Astro Content Collections で管理される。

**記事ファイルの場所**: `src/data/articles/`

**ファイル名規約**: `YYYY-MM-DD_slug.md` (例: `2025-12-07_first-post.md`)

- 日付部分は公開日として抽出される
- 形式が不正な記事は自動的に除外される

**スキーマ定義**: `src/content.config.ts`

- `title` (必須)
- `description` (オプション)
- `tags` (オプション)
- `draft` (デフォルト: false)

### 記事の公開日管理

`src/lib/article.ts` に記事関連のユーティリティ関数がある。

- `addPublishDateToArticles()`: ファイル名から日付を抽出し、記事オブジェクトに `publishDate` を追加
- `extractDateFromId()`: 記事 ID から日付を抽出 (内部関数)
- 不正な日付形式の記事は警告を出力して除外される

## コーディングルール

### ドキュメント作成

- 具体的なコード例は記述しない
- ルールの要点のみを簡潔に記述する

### 記事の `publishDate` 管理

記事に `publishDate` が必要な場合は、必ず `getStaticPaths()` 内で `addPublishDateToArticles()` を使って付与する。ページ側では props から受け取るだけ。

### 静的サイトの特性

このプロジェクトは静的サイト (SSG) のため、`getStaticPaths()` を使う動的ルートでは以下は不要。

- ❌ パラメータの undefined チェック
- ❌ `Astro.redirect()` による 404 リダイレクト

ビルド時に生成されたパスのみが存在し、存在しないパスは Web サーバーレベルで 404 になる。

## コードレビュー

### HTML 構造

以下の観点を必ずチェックする。

- セマンティック HTML の使用 (`<article>`, `<section>`, `<nav>`, `<header>`, `<footer>` など)
- アクセシビリティ (ARIA 属性、alt テキスト、適切な見出しレベル)
- HTML の階層構造が論理的か
- 不要な div のネストがないか
- Tailwind CSS のクラス名が適切か

## Git

### コミットメッセージ

- コミットメッセージは1行で簡潔に記述する
- 複数行のコミットメッセージは使用しない

## プルリクエスト作成

プルリクエストを作成する際は、`.github/pull_request_template.md` のテンプレートに従うこと。

### テンプレート使用のルール

- 該当しないセクション（スクリーンショットなど）は削除する
- 実装の意図や設計判断を明確に記述する

### ディスクリプションの書き方

- 変更したファイルや実装内容を列挙しない
- 概要、背景・モチベーション、実装の意図を簡潔に記述する
- 「何をしたか」よりも「なぜそうしたか」を重視する
