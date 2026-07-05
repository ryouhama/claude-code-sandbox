---
name: create-pr
description: 現在の変更から GitHub のプルリクエストを作成する。ブランチ作成・コミット・push・gh CLI での PR 作成までを行う。ユーザーが「PR を作って」「プルリクを出して」等と言ったときに使う。
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git diff:*), Bash(git log:*), Bash(gh pr create:*), Bash(gh pr view:*)
---

# Create PR スキル

現在の変更を GitHub のプルリクエストにまとめる。

## 手順

1. **状態確認**
   - `git status` と `git diff` で未コミットの変更を把握する。
   - `git branch --show-current` で現在のブランチを確認する。

2. **ブランチの用意**
   - `prod`(デフォルトブランチ)にいる場合は、作業用ブランチを切る。
   - ブランチ名は Conventional Commits の type を接頭辞にした kebab-case にする。
     例: `feat/add-login`, `fix/css-not-applied`, `chore/update-docs`, `docs/xxx`, `refactor/xxx`。

3. **コミット**
   - 未コミットの変更があれば、Conventional Commits 形式でコミットする。
   - 既にコミット済みなら、このステップはスキップ。

4. **push**
   - `git push -u origin <branch>` で作業ブランチを push する。

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
