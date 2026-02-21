---
title: サムネイルを表示するようにした
tags: ["サイト更新"]

---

記事中の画像URLを取得し，サムネイルに設定するようにした



https://i.imgur.com/UMAMTmx
before

https://i.imgur.com/Lk1iubP
after

## 画像URLの取得方法

記事中に最初に出現する画像のURL（正確には違うけど）をサムネイルとして設定する．URL取得の実装はこんな感じ．

```js
const extractThumbnailUrl = (markdown) => {
  const start = markdown.indexOf("imgur.com");
  if (start === -1) return undefined;

  const end1 = markdown.indexOf("\n", start);
  const end2 = markdown.indexOf(" ", start);
  const end = Math.min(end1, end2);
  return convertThumbnailUrl(markdown.slice(start, end).split("|")[0]);
};

const convertThumbnailUrl = (url) => 
	url ? `https://i.imgur.com/${url.substring(url.lastIndexOf("/") + 1)}#.png` : "";
```

記事からimgurのURLを探して，URL文字列を取得する．URLの終端は改行か空白で判定する．基本的に，記事に表示されている画像をサムネイルとして扱うが，記事には画像を表示せずにサムネイルを設定したいときもあるかもしれないので，以下の両方の形式に対応できるようにした。

```
https://i.imgur.com/xxxxxx	// 記事に画像が挿入され，サムネイルにも利用される
https://imgur.com/xxxxxx		// "i." は合ってもなくてもよい
<!-- https://i.imgur.com/xxxxxx --> // 記事には画像が挿入されないが，サムネイルには利用される
```

`|`でURLを区切っているのは，`https://imgur.com/xxxxxx|0.7`というように，末尾の数値で画像サイズを変更できるようにしてあるから．

`convertThumbnailUrl`で`#`をURLに含めているのは，`url.replace("#", "画像サイズ")`のように，大きさを指定できるようにするため．

## スタイルについて

現在，要素の構造が以下のようになっている．

- item
  - thumbnail
  - content
    - link
      - date
      - title
      - description
    - tags

thumbnailかlinkの要素にマウスを合わせたとき，それらの要素の色や透明度が変更するようにしたい．ただ，上記の構造だとやり方がわからない．

- item
  - content
    - thumbnail
    - link
      - date
      - title
      - description
  - tags

こんな構造なら，content以下の要素だけを考えれば良いので，実現できそう．ただ，この構造にすると，thumbnailやtagsが表示される位置を変更する必要がある．

うまいやりかたはないものか．

あと，コード部分が見にくいしはみ出るしでどうにかしないといけない．