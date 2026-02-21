---
title: FirebaseをAndroidアプリに追加したときにつまずいたポイント
tags: ["Android"]
---

Firebaseを使った際に出会ったエラーたち．

## AndroidアプリにFirebaseを追加する

これは、Firebaseコンソールから行う。

名前や鍵を設定し、google-services.jsonをダウンロードし、所定の位置に置く。
その後、gradleファイルを変更する。

app_name/app/src/build.gradleを以下のように変更。

```
dependencies {
  ...
  compile 'com.google.firebase:firebase-core:11.8.0'
  ..
}
apply plugin: 'com.google.gms.google-services'
```

app_name/build.gradleを以下のように変更。

```
buildscript {
  ...
  dependencies {
    ...
    classpath 'com.google.gms:google-services:3.2.0'
  }
}
```

次に、画面上側のオレンジのバーのSyncをクリックする。
しかし、エラー。

## Failed to resolve: com.google.firebase:firebase-core:9.0.0

### 解決策

app_name/build.gradleを以下のように変更。

```
allprojects {
    repositories {
        jcenter()
        maven {
            url "https://maven.google.com"
        }
    }
}
```

### 参考

[android - Failed to resolve: com.google.firebase:firebase-core:9.0.0 - Stack Overflow](https://stackoverflow.com/questions/37310188/failed-to-resolve-com-google-firebasefirebase-core9-0-0)

しかし、エラー。

## File google-services.json is missing. The Google Services Plugin cannot function

### 解決策

google-services.jsonは、app_name直下ではなく、app_name/appに置く。

しかし、エラー。

## No matching client found for package name '〇〇'

### 解決策

app_name/app/google-services.jsonの以下の部分を変更。

```
"client": [
{
  "client_info": {
    "mobilesdk_app_id": "9:99999999:android:9ccdbb6c1ae659b8",
    "android_client_info": {
      "package_name": "　ここを一致させる　"
    }
  }
}
```

com.exampleになっていたので、正しいものに変更する。

## 参考

[Android Studio Gradle: Error:Execution failed for task &#39;:app:processDebugGoogleServices&#39;. &gt; No matching client found for package - Stack Overflow](https://stackoverflow.com/questions/34679411/android-studio-gradle-errorexecution-failed-for-task-appprocessdebuggoogles)
