---
title: Twitter Ads API の ID は base-36 でエンコードされている
tags: ["広告"]
thumbnail: "https://i.imgur.com/INJhj6Hm.webp"
---

広告の ID が管理画面と API で違うと思ったら基数が違うだけだった。



https://i.imgur.com/INJhj6H|0.7



## 概要

管理画面ではキャンペーンや広告の ID が整数で、API では英数文字である。これは単に 10 進数 ⇄ 36 進数の変換をしているだけである。

> Campaign identifiers (`:campaign_id`) are the base-36 representation of the base-10 value we present in the Twitter Ads UI.  
>[Overview | Docs | Twitter Developer Platform](https://developer.twitter.com/en/docs/twitter-ads-api/campaign-management/overview)

> These entities have their own IDs, which are alpha-numeric and are represented as base-36-encoded values. For example, promoting the published Tweet above—that is, associating it a line item 6c62d—returns the following API response.  
> [Tweets | Docs | Twitter Developer Platform](https://developer.twitter.com/en/docs/twitter-ads-api/creatives/guides/tweets)

フォーラムでもこの質問は何度かされている。

> Ads API では基本的に base 36 の文字列を取り扱います。これは UI 上で確認できる base10 を base36 に変換したものです。  
> [Campaign ID の整数取得方法 - Advertiser Tools and APIs / Ads API Japanese - Twitter Developers](https://twittercommunity.com/t/campaign-id/129808)

このスレッドでは base32 が出てくる。

> Promoted Tweet ID (Base32) is unique.  
> [Cannot fetch promoted tweets stats per line_item - Advertiser Tools and APIs / Ads API SDKs - Twitter Developers](https://twittercommunity.com/t/cannot-fetch-promoted-tweets-stats-per-line-item/127457/3)

10 進数で ID を扱うと言語によってはオーバーフローして値がおかしくなることもあるそう。

## 変換方法

Python なら `int` が使える。

```python
int(campaign_id, 36)
```

API からデータを取得すると、キャンペーン ID や広告グループ ID（Line Item ID）は 36 進数で返ってくるが、広告 ID (Promoted Tweet ID) は 10 進数で 返ってくる。
