---
description: カレントブランチのPRをマージ
---

# カレントブランチのPRをマージ

カレントブランチに関連するPRを検索し、マージを実行してください。

## 引数

マージ方法を指定できます（省略時は`--merge`）：
- `--merge`: 通常のマージコミット（デフォルト）
- `--squash`: Squashマージ
- `--rebase`: Rebaseマージ

## 手順

1. `gh pr view --json number,title,state,mergeable,mergeStateStatus` でPR情報を取得
2. PR番号、タイトル、状態をユーザーに表示
3. 引数でマージ方法が指定されている場合はそれを使用、なければ`--merge`を使用
4. マージ可能な場合、`gh pr merge <PR番号> <マージ方法> --delete-branch` を実行
5. マージ結果を報告

## 注意事項

- PRが存在しない、またはマージ不可能な場合は、その旨をユーザーに伝える
- エラーが発生した場合は、詳細を報告する
