---
description: カレントブランチからPRを作成
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(gh:*), AskUserQuestion
---

# カレントブランチからPRを作成

カレントブランチの変更内容を確認し、対話的な質問を通じてGitHub上にPull Requestを作成してください。

## 使用方法

```
/create-pr
```

引数は不要です。実行すると、以下の項目について対話的に質問されます：
- ベースブランチの選択（デフォルト: `prod`）
- PRタイトルの確認（変更内容から自動生成）
- ラベルの選択（変更内容から自動選択、確認可能）

## 手順

1. `git status` でカレントブランチと変更状態を確認
   - addされていないファイル（Changes not staged for commit や Untracked files）がある場合、ユーザーにそのまま作業を進めてよいか確認する

2. AskUserQuestionツールでベースブランチを質問:
   - デフォルトは `prod` を推奨（Recommended）
   - 選択肢: `prod` (Recommended), `prod`, `develop`, Other（カスタム入力）
   - 質問: "Which branch should this PR be merged into?"
   - header: "Base Branch"

3. `git log <ベースブランチ>..HEAD` で、このブランチの独自のコミットを確認

4. `git diff <ベースブランチ>...HEAD` で変更内容を確認

5. コミット内容と変更差分を分析して適切なPRタイトルを生成

6. AskUserQuestionツールでPRタイトルを質問:
   - 生成したタイトルを推奨（Recommended）
   - 選択肢: <生成したタイトル> (Recommended), Other（カスタム入力）
   - 質問: "What should the PR title be?"
   - header: "PR Title"

7. `gh label list --limit 100` で利用可能なラベルを取得

8. コミット内容と変更差分を分析し、適切なラベルを自動選択（複数可）
   - 例: 新機能追加なら `enhancement`、バグ修正なら `bug`、ドキュメント変更なら `documentation`

9. AskUserQuestionツールでラベルを質問:
   - 自動選択したラベルを推奨（Recommended）
   - multiSelect: true を使用
   - 選択肢: 利用可能な全ラベルを表示
   - 質問: "Which labels should be applied to this PR?"
   - header: "Labels"

10. `.claude/pr-template.md` を読み込み、コミット内容と変更差分を分析してテンプレートの各セクションを埋める

11. 埋めた内容を `.claude/work/pr-body.md` に書き出す

12. `gh pr create --base <ベースブランチ> --title "<タイトル>" --body-file ".claude/work/pr-body.md" --label "<ラベル1>,<ラベル2>,..."` でPRを作成
    - ラベルがない場合は `--label` オプションを省略

13. 作成されたPR URLをユーザーに報告

## 注意事項

- ベースブランチのデフォルト推奨は `prod`（対話的に選択可能）
- AskUserQuestionツールを使用してユーザーとの対話的な体験を提供する
- コミットがない場合や、すでにPRが存在する場合は、その旨をユーザーに伝える
- PRタイトルは変更内容から生成され、ユーザーに提案して確認を求める
- PRの説明には変更内容の要約を含める
- ラベル選択は変更内容に基づいて自動的に行われる（例: 新機能追加なら `enhancement`、バグ修正なら `bug` など）
