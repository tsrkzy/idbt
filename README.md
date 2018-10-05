this is dev version.
現在開発中です。


# idbt

idobata unofficial cli tool.

プログラマのためのSNS [Idobata](https://idobata.io/ja/home) の **非公式** CLIクライアントです。

# function

* show timeline 
* post message

チャンネルを選択し、タイムラインの表示とチャットの投稿が可能です。

# install

```
$ npm install --global idbt # recommend: to global.
```

グローバルへインストールして使用することを想定しています。

# usage

ユーザディレクトリの直下に、設定ディレクトリ `~/.idbt` を作成します。
アンインストールの際は、お手数ですが手動で削除してください。

```
$ idbt init # 初期設定。トークンを取得し、カレントチャンネルを指定します。
$ idbt list # チャンネルのチャットを最新のものから表示します。
$ idbt post # チャットを投稿します。
$ idbt channel # チャンネルを変更します。
```