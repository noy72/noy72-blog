---
title: Next.js で Cluod CDN の署名付き Cookie を使用するときにつまづいたこと
tags: ["Google Cloud", "Next.js"]
---

署名付き Cookie を設定して Cloud Storage の静的ファイルを配信するため、Next.js でエンコードせずに Cookie を設定する方法を調べて、最終的に Cookie 生成 API を立てた。

## やりたいこと

特定のページにアクセスした際、署名付き Cookie を設定して Cloud Storage にある静的ファイルを配信する。

[署名付き Cookie を使用する  |  Cloud CDN  |  Google Cloud](https://cloud.google.com/cdn/docs/using-signed-cookies?hl=ja#:~:text=%25E7%25BD%25B2%25E5%2590%258D%25E4%25BB%2598%25E3%2581%258D%2520Cookie%2520%25E3%2581%25AF%25E3%2580%2581%25E3%2583%25A6%25E3%2583%25BC%25E3%2582%25B6%25E3%2583%25BC,%25E4%25BB%25A3%25E3%2582%258F%25E3%2582%258A%25E3%2581%25A8%25E3%2581%25AA%25E3%2582%258B%25E6%2589%258B%25E6%25AE%25B5%25E3%2581%25A7%25E3%2581%2599%25E3%2580%2582%5D)

最終的にやったこと: Cookie 生成 API を作る。

## つまづいたこと

### Cookie の値がエンコードされる

Next.js では `cookies().set(name, '')` で Cookie を設定できる。この際、値は `encodeURIComponent` でエンコードされる。

[Functions: cookies | Next.js](https://nextjs.org/docs/app/api-reference/functions/cookies)

Cloud CDN で使用する署名付き Cookie には `=` が含まれているため、この方法で設定した Cookie では検証に失敗する。そこで、エンコードせずに Cookie を設定しなければならない。

`CookieSerializeOptions` には `encode` といういかにもなオプションがあるが、定義されているだけで使えない。

`NextApiResponse.headers.set` で `Set-Cookie` ヘッダに直接値を設定することでエンコードを避けられる。

### Server Actions でエンコードしない Cookie を設定できない

Server Actions では、 `cookies()`は使えるがレスポンスヘッダーに直接値を設定できない。

### middleware に \_rscリクエストが飛んでCookieが書き換わってしまう

これは Cookie の問題ではないが見落としていたポイント。

特定のページへアクセスしたときに middleware で Cookie を設定する実装にしていた。Cookie 自体は正しく設定できていたが、特定の要素をスクロールすると Cookie がどんどん書き換わる現象が起こった。

原因は Link タグの prefetch だった。Link タグがスクロールによってユーザーのビューポートに入ると、リンク先にリクエストが送信され、そのたびに middleware で Cookie を書き換える処理が走っていた。

[Components: <Link> | Next.js](https://nextjs.org/docs/app/api-reference/components/link)

## 最終的にやったこと: Cookie生成APIを叩く

Cookie を設定する API を作り、ページにアクセスしたときに API を叩いて Cookie を設定するようにした。
