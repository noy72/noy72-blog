---
title: dein.vimとdeopleteをmacにインストールする。
tags: ["開発環境", "Vim"]

---

vimのプラグインをインストールした

## 環境

- mac
- vim 8.0.1300 

暗黒のVimmer（見習い）

## dein.vim

https://github.com/Shougo/dein.vim|embed

dein.vimは暗黒のプラグインマネージャです。
元々neobundleを使っていましたが、後継が1.5年前に出ているのでさすがに乗り換えました。

### インストール

githubのQuick start、 [dein.vimのインストール自体にハマってしまったメモ - Qiita](https://qiita.com/Coolucky/items/0a96910f13586d635dc0) を参照。

```
１、Run below script.

$ curl https://raw.githubusercontent.com/Shougo/dein.vim/master/bin/installer.sh 
    > installer.sh
$ sh ./installer.sh {specify the installation directory}
```

これを実行すると、最後に「今表示したscriptをvimrcに貼り付けてね（意訳）」と表示されるので見逃さずに貼り付けましょう（1敗）。

```
" If you want to install not installed plugins on startup.
if dein#check_install()
  call dein#install()
endif
```

この部分のコメントアウトを外して起動時にインストールするようにします。

```
You can specify revision/branch/tag.
call dein#add('Shougo/deol.nvim', { 'rev': 'a1b5108fd' })
```

vim8だとこの部分で deol.nvim requires Neovim と言われます。
, { 'rev': 'a1b5108fd' } の部分を消して、deol.nvimを削除、その後インストールすれば使えます。

## deoplete.nvim

https://github.com/Shougo/deoplete.nvim#requirements|embed

自動補完プラグイン。

### インストール

vimrcに以下を記述。
C++の補完のため、deoplate-clangもインストールする。
[GitHub - deoplete-plugins/deoplete-clang: deoplete.nvim source for C/C++/Obj-C/Obj-C++ with clang-python3](https://github.com/deoplete-plugins/deoplete-clang)

```
brew install cmake
brew install llvm --with-clang
```

必要なものを揃える。

```
call dein#add('Shougo/deoplete.nvim')
call dein#add('zchee/deoplete-clang')
if !has('nvim')
  call dein#add('roxma/nvim-yarp')
  call dein#add('roxma/vim-hug-neovim-rpc')
endif
```

上記をvimrcに追加。

```
g:deoplete#sources#clang#libclang_path
g:deoplete#sources#clang#clang_header
```

この二つの設定は必須です。
libclang\_pathにはlibclang.dylibへのpath、clang\_headerはclangディレクトリへのpathです。
libclang\_pathと同じディレクトリにclangのディレクトリがあれば、それへのpathをclang\_headerにします。

denite.vimはうまく動かないので諦めました。

## 参考

[NeovimでモダンなPython環境を構築する - Qiita](https://qiita.com/lighttiger2505/items/e0ada17634516c081ee7)
