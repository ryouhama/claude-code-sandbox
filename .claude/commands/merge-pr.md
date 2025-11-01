---
description: カレントブランチのPRをマージ
argument-hint: [PR番号] [--merge|--squash|--rebase]
allowed-tools: Read, Grep, Glob, Bash(gh pr:*), Bash(git branch:*)
---

# PRをマージ

指定されたPR番号、またはapproveされているPRから選択してマージを実行してください。

## 引数

1. PR番号（省略可能）: マージするPRの番号を指定
2. マージ方法（省略可能）: マージ方法を指定（デフォルトは`--merge`）
   - `--merge`: 通常のマージコミット（デフォルト）
   - `--squash`: Squashマージ
   - `--rebase`: Rebaseマージ

## 手順

### PR番号が指定されている場合

1. `gh pr view <PR番号> --json number,title,state,mergeable,mergeStateStatus` でPR情報を取得
2. PR番号、タイトル、状態をユーザーに表示
3. 引数でマージ方法が指定されている場合はそれを使用、なければ`--merge`を使用
4. マージ可能な場合、`gh pr merge <PR番号> <マージ方法> --delete-branch` を実行
5. マージ結果を報告

### PR番号が指定されていない場合

1. `gh pr list --json number,title,state,author,reviewDecision --state open` でオープン中のPRリストを取得
2. `reviewDecision`が`APPROVED`のPRのみをフィルタリング
3. approveされたPRがない場合は、その旨をユーザーに伝える
4. approveされたPRがある場合:
   - PR番号、タイトル、作成者を一覧表示
   - ユーザーにどのPRをマージするか質問
   - ユーザーの選択後、上記の「PR番号が指定されている場合」の手順を実行

## 注意事項

- PRが存在しない、またはマージ不可能な場合は、その旨をユーザーに伝える
- エラーが発生した場合は、詳細を報告する
- approveされていないPRをマージする場合は、警告を表示する
