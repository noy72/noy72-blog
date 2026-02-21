---
title: ブログカードを使えるようにした
tags: ["サイト更新"]

---

はてなブログカードを使って，記事にサイトを埋め込めるようにした．

もちろん，マークダウンにタグをコピペすればブログカードを表示できるけど，せっかくなのでプラグインを拡張した．URLの末尾に特定の文字列をくっつけると，文字列によって表示が変わる．

## URLのみ

`https://www.google.com/`

https://www.google.com/

## URL+title

`[Google](https://www.google.com/)`

[Google](https://www.google.com/)

## URL+embed

`https://www.google.com/|embed`

https://www.google.com/|embed



ブログサービスを使っているときはWebサイトやTwitter，youtubeの埋め込みをよしなにしてくれるからあまり意識しなかったけど，自分でブログを運用するとその辺りを考えないといけない．

## HTMLを分かっていなかった事例

埋め込むと記事が消えた．具体的には，埋め込んだ部分より下の部分がなくなる．

<hr>


https://i.imgur.com/40Xhw1l|0.7
埋め込み機能を停止している状態．見出しやリストが表示されている．



<hr>


https://i.imgur.com/3xwffF6|0.7
埋め込み機能を有効にしている状態．見出しやリストが表示されていない．



### 原因

URLを置き換えているiframe要素が，正しく閉じられていなかった．`<iframe />`ではなく`<iframe></iframe>`．

````json
...
node.value = `
  <iframe 
  class="hatenablogcard" 
  style="width:100%; height:155px; max-width:640px;" 
  src="https://hatenablog-parts.com/embed?url=${url}" 
  width="300" height="150" frameborder="0" scrolling="no" />`;
  // タグが閉じてない
...
````

雰囲気で書いてはいけない．

