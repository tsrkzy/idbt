this is dev version.
現在開発中です。


# idbt

idobata unofficial cli tool.

プログラマのためのSNS [Idobata](https://idobata.io/ja/home) の非公式CLIクライアントです。
ターミナルソフト、各種IDE･エディタ付属のターミナルから実行し、仕事中に流し見をしやすいようにカラーリング&圧縮したタイムラインを表示します。

## thanks for

* [初めてのnpm パッケージ公開 - Qiita](https://qiita.com/TsutomuNakamura/items/f943e0490d509f128ae2)
* [chalk/chalk: 🖍 Terminal string styling done right](https://github.com/chalk/chalk)
* [sindresorhus/cli-spinners: Spinners for use in the terminal](https://github.com/sindresorhus/cli-spinners)
* [SBoudrias/Inquirer.js: A collection of common interactive command line user interfaces.](https://github.com/SBoudrias/Inquirer.js)
* [domchristie/turndown: 🛏 An HTML to Markdown converter written in JavaScript](https://github.com/domchristie/turndown)
* [yargs/yargs: yargs the modern, pirate-themed successor to optimist.](https://github.com/yargs/yargs)


## installation

グローバルで使用する事を想定していますので、 `-g` オプションを指定してください。
※現在は開発版のため、バンドル化を行っておらず、そのため、依存ライブラリをグローバルに展開します。
Node.jsでの開発者の方など、グローバルにモジュールをインストールしたくない場合は、ローカルでのインストールをお試しください。

```
# global
$ npm install -g idbt

# local
$ mkdir -p ~/idbt # 適当なディレクトリを作成
$ cd ~/idbt
$ npm install idbt
```

## uninstallation

```
# 設定ファイルの削除
$ rm -rf ~/.idbt

# global
$ npm uninstall -g idbt

# local
$ # インストールしたディレクトリを削除してください。
```

# usage

グローバルにインストールした場合は `$ idbt init`、
ローカルにインストールした場合は、エントリーポイントの `/bin.js` を実行する形で呼び出す必要があります。
インストールしたディレクトリに移動して `$ node bin init`、または直接 `$ node {PATH_idbt}/bin init` のように呼び出してください。

以降の手順では、グローバルにインストールした場合のコマンド例を記載します。

## get tokens & create config file

idobata APIへのアクセスにはトークンが必要です。
トークンはID(e-mail)とパスワードを使用し、Token APIから取得します。

```
$ idbt init
```

画面の指示に従い、IDとパスワードを入力し、矢印キーでチャンネルを選択してください。
ユーザディレクトリの直下に、設定ファイル `~/.idbt` を作成します。
IDと取得したトークン、選択したチャンネルは設定ファイルに格納し、パスワードは保存しません。

> 選択したチャネルは **カレントチャンネル** として設定ファイルに格納し、タイムライン読み出し･投稿の際に参照します。

## show config values

現在の設定を確認できます。
開発版なので表示が乱暴ですが。

```
$ idbt config
```

## show list

カレントチャンネルのタイムラインを表示します。
HTML形式のidobata APIのレスポンスをMarkdownへパースして空行などを圧縮、
画像やリンク等のコンテンツをマークアップして表示します。
上記の仕様上、表示する内容をそのまま再投稿しても、正しいMarkdown記法としてパースされない場合があります。

```
$ idbt list 

# shorthand
$ idbt l
```

> ページングの追跡は未実装です……。

## change current channel

カレントチャンネルの切り替えを行うことができます。

```
$ idbt channel

# shorthand
$ idbt c
```

## post messages

```
# use stdin
$ idbt post "hello idobata."

# open vim. post[:wq], abort[:q!] 
$ idbt post 

# open emacs. post[x-S x-C], abort[x-C]
$ idbt post --emacs


# shorthand
$ idbt p "hello idobata."
$ idbt p 
$ idbt p --emacs
```

## help

`--help` オプションが使用できます。

```
$ idbt --help
$ idbt l --help 
$ idbt p --help 
```

# もくひょう

* 各種WIP
* ドラフト(下書き)機能
* Emoji対応
* watchモード ($ tail -f しながら投稿もできる的なモード)