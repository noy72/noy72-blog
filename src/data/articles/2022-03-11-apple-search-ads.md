---
title: Apple Search Ads のアクセストークンの有効期限が短すぎると invalid_client エラーが出る
tags: ["広告"]
---

出会った些細なエラーについて書いた。

## アクセストークンの有効期限

Apple Search Ads を利用するためにはアクセストークンを生成する必要がある。

[Implementing OAuth for the Apple Search Ads API | Apple Developer Documentation](https://developer.apple.com/documentation/apple_search_ads/implementing_oauth_for_the_apple_search_ads_api)

アクセストークンには有効期限を設定できる。サンプルコードでは以下のように設定されている。

```
expiration_timestamp = issued_at_timestamp + 86400*180
```

> The UNIX UTC timestamp of when the client secret expires. The value must be greater than the current date and time, and less than 180 days from the `iat` timestamp.

有効期限は最長 180 日で設定できる。

## 短すぎるとダメ

`The value must be greater than the current date ...` とあるが、`32400` ぐらいに設定すると ` {'error': 'invalid_client'}` が返ってくる。
