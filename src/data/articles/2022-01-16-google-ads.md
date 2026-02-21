---
title: Google Ads の Ad Group Ad と Asset とは何か
tags: ["広告"]
---

別の広告プラットフォームに比べてわかりにくかったので調べた。



## Ad Group Ad

[API Structure &nbsp;|&nbsp; Google Ads API &nbsp;|&nbsp; Google Developers](https://developers.google.com/google-ads/api/docs/concepts/api-structure)



上記のリンク先の図を見ると、Campaign ＞ Ad Group ＞ Ads という木構造になっていることがわかる。`AdGroupAd`はこの図には出てこないが説明文には出てくる。

> Each `AdGroup` contains one or more [ad group ads](https://developers.google.com/google-ads/api/reference/rpc/v9/AdGroupAd). An `AdGroupAd` represents an ad that you're running.

`AdGroup` には複数の `AdGroupAd` が含まれており、それは運用中の広告を表すらしい。では `Ad` は何なのか。




[Entity relationships &nbsp;|&nbsp; Google Ads API &nbsp;|&nbsp; Google Developers](https://developers.google.com/google-ads/api/docs/concepts/entity-relationships#ad_group_ads)

`AdGroupAd` はひとつの `Ad` オブジェクトで構成される。そして、`Ad` オブジェクトはひとつの `XXXinfo` を含む。



### 型

[AdGroupAd &nbsp;|&nbsp; Google Ads API &nbsp;|&nbsp; Google Developers](https://developers.google.com/google-ads/api/reference/rpc/v9/AdGroupAd)

`AdGroupAd` は `Ad` や広告の状態（ENABLED, REMOVEDなど）を持つ。



[Google Ads API &nbsp;|&nbsp; Google Developers](https://developers.google.com/google-ads/api/reference/rpc/v9/Ad)

広告の具体的な情報は `Ad` が持つ。例えば、広告の説明文に表示される URL や広告のタイプ（TEXT_AD, VIDEO_AD など）が含まれる。



実際に API からデータを落としてみると以下のような形式で返ってくる。

```
ad_group_ad {
  resource_name: "customers/<id>/adGroupAds/<id>"
  ad {
    resource_name: "customers/<id>/ads/<id>"
    id: <id>
  }
}
```



## Assets

特定の広告に関連づけられるコンテンツ（テキスト、画像、動画など）のことである。広告アセットの resource_name（ユニークな識別子）は以下の形式である。

```
customers/{customer_id}/adGroupAdAssetViews/{AdGroupAdAsset.ad_group_id}~{AdGroupAdAsset.ad_id}~{AdGroupAdAsset.asset_id}~{AdGroupAdAsset.field_type}
```

広告は複数の広告アセットを持つことができる。実際に出る広告には複数の広告アセットが含まれることもある。

> アプリ キャンペーンでは、各ネットワークに合わせて広告がさまざまなフォーマットで掲載されます。アセットを組み合わせて広告が作成され、自動的に調整が行われます。  
>
> [アプリ キャンペーンのアセットと広告 - Google 広告 ヘルプ](https://support.google.com/google-ads/answer/6357595?hl=ja)

> ほとんどの広告は複数のアセットを含んでいるため、表示回数が複数の行で重複してカウントされている場合もあります。
>
> [アプリ キャンペーンのアセット レポートについて - Google 広告 ヘルプ](https://support.google.com/google-ads/answer/6310436?hl=ja)



API から広告アセットごとのメトリクスを取りたい場合は、以下のようにクエリが書ける。このクエリでは日 * 広告アセットごとにクリック数などを取得する。

```sql
SELECT
  ad_group_ad_asset_view.resource_name,
  metrics.impressions,
  metrics.clicks,
  metrics.all_conversions,
  metrics.cost_micros,
  segments.date
FROM ad_group_ad_asset_view
WHERE segments.date >= "2022-01-01" AND segments.date <= "2022-01-07"
ORDER BY metrics.impressions DESC
```



## 解決していないこと

Ad と Asset の関係。https://ads.google.com/aw/overview をみるとキャンペーン ＞ 広告グループ ＞ 広告アセットの構造になっていて、Ad（広告）が出てこない。



### 追記：2022/01/17

> キャンペーン ＞ 広告グループ ＞ 広告アセットの構造

これは間違っていて、キャンペーンタイプによって広告グループをクリックしたときの遷移先が変わるのだと思う。キャンペーンタイプが Search になっているキャンペーンに含まれる広告グループ一覧から広告グループ名をクリックしたらキーワード一覧が表示された。



サイドバーの「広告」を押して「View asset details（アセットの詳細）」を押すと広告アセットが表示された。Ad はクリックしたときの遷移先などを持ち、Asset は広告として出す画像やテキストのことだと思う。クリエイティブが Asset で、クリエイティブによって誘導するコンテンツの情報が Ad になっていると認識している。

つまり、キャンペーン ＞ 広告グループ ＞ 広告 ＞ 広告アセット。ただし、アセットは

> 特定の広告に関連づけられるコンテンツ（テキスト、画像、動画など）のことである。

ので、全ての広告に必ず広告アセット結びついているわけではない。
