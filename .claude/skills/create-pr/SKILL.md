---
name: create-pr
description: 現在の変更から GitHub のプルリクエストを作成する。ブランチ作成・コミット・push・gh CLI での PR 作成までを行う。ユーザーが「PR を作って」「プルリクを出して」等と言ったときに使う。
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git switch:*), Bash(git checkout:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git diff:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(gh pr create:*), Bash(gh pr view:*)
---

# Create PR スキル

現在の変更を GitHub のプルリクエストにまとめる。

> **起動バナー**: 作業を始める前に、最初に `🚀 create-pr skill 起動` とだけ1行出力する
> (スキルが動いたことを視認するため)。

## 手順

1. **状態確認(最初に必ず実行)**
   - `git branch --show-current` で現在のブランチを確認する。
   - `git status` と `git diff` で未コミットの変更を把握する。
   - `prod` にいる場合は、`git rev-list --count origin/prod..HEAD` で
     **origin より先行しているローカルコミットの有無**も確認する。

2. **ブランチの用意(prod では必ず退避)**
   `prod`(デフォルトブランチ)にいる場合は、作業前に必ず作業用ブランチへ移す。
   - **未コミットの変更だけがある場合**: そのまま作業ブランチを切る
     (`git switch -c <branch>`。未コミット変更は新ブランチに引き継がれる)。
   - **既に prod 上でコミット済みの変更がある場合**(手順1で先行コミットを検出):
     1. その先行コミットを載せた作業ブランチを作る(`git branch <branch>`)。
     2. ローカル `prod` を `origin/prod` に戻す(`git reset --hard origin/prod`)。
        ※ この reset は `origin/prod` に無いローカルコミットだけを対象にすること。
        既に origin/prod に push 済みのコミットには使わない(force-push が必要になり危険)。
     3. 作業ブランチに切り替える(`git switch <branch>`)。
   - ブランチ名は Conventional Commits の type を接頭辞にした kebab-case にする。
     例: `feat/add-login`, `fix/css-not-applied`, `chore/update-docs`, `docs/xxx`, `refactor/xxx`。

3. **コミット**
   - 未コミットの変更があれば、Conventional Commits 形式でコミットする。
   - 既にコミット済みなら、このステップはスキップ。

4. **push(prod へは絶対に push しない)**
   - push 先ブランチが `prod` でないことを確認してから `git push -u origin <branch>` する。
   - **`prod` / `main` へ直接 push してはいけない。** 変更は必ず PR 経由で取り込む。
   - force-push(`--force` / `--force-with-lease`)はこのスキルでは行わない。
     必要な場面はユーザーに確認する。

5. **PR 作成**
   - `gh pr create` で `prod` 向けの PR を作成する。
   - タイトルは Conventional Commits 形式。
   - 本文は下記テンプレートに沿って記述する。
   - 作成後、PR の URL をユーザーに伝える。

## PR 本文テンプレート

```markdown
## 概要
<!-- 何を・なぜ変更したか -->

## 変更点
<!-- 箇条書きで主要な変更 -->
-

## 確認したこと
<!-- 動作確認・テスト内容 -->
-
```

## 注意

- ベースブランチは `prod`。
- `main` ブランチが指定された場合を除き、常に `prod` を base にする。
- push・PR 作成は外部への公開操作なので、対象ブランチと base を確認してから実行する。
- 認証エラー等で `gh` が失敗した場合は、`gh auth status` の確認をユーザーに促す。
