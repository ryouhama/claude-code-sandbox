---
description: カレントブランチからPRを作成
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(gh:*)
---

# カレントブランチからPRを作成

カレントブランチの変更内容を確認し、GitHub上にPull Requestを作成してください。

## 引数

キーワード引数形式で指定できます（すべて省略可能）：
- `--title "タイトル文字列"`: PRタイトルを指定（省略時は変更内容から自動決定）

例:
- `/create-pr --title "Add new feature"` → タイトルは "Add new feature"
- `/create-pr` → タイトルを変更内容から自動生成

## 手順

1. `git status` でカレントブランチと変更状態を確認
   - addされていないファイル（Changes not staged for commit や Untracked files）がある場合、ユーザーにそのまま作業を進めてよいか確認する
2. `git log prod..HEAD` で、このブランチの独自のコミットを確認
3. `git diff prod...HEAD` で変更内容を確認
4. PRタイトルを決定:
   - `$ARGUMENTS` に `--title "..."` が含まれている場合はその値を使用
   - 指定されていない場合は、コミット内容と変更差分から適切なタイトルを生成
5. `.claude/pr-template.md` を読み込み、コミット内容と変更差分を分析してテンプレートの各セクションを埋める
6. 埋めた内容を `.claude/work/pr-body.md` に書き出す
7. `gh pr create --base prod --title "<タイトル>" --body-file ".claude/work/pr-body.md"` でPRを作成
8. 作成されたPR URLをユーザーに報告

## 注意事項

- ベースブランチは `prod` を使用
- コミットがない場合や、すでにPRが存在する場合は、その旨をユーザーに伝える
- PRの説明には変更内容の要約を含める
