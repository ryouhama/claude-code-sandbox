---
description: 変更をステージして Conventional Commits 形式でコミットする(push はしない)
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
---

現在の変更内容を確認し、適切な粒度でコミットしてください。

手順:

1. `git status` と `git diff` で変更内容を把握する。
2. 変更の意図を表す Conventional Commits 形式のメッセージを作成する。
3. コミットする。`push` はしない。
