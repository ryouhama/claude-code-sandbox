---
name: hello-world
description: サンドボックスの動作確認用サンプルスキル。Claude Code のスキルの書き方を示す。ユーザーが「hello skill を試す」「スキルの例を見せて」等と言ったときに使う。
---

# Hello World スキル

Claude Code のスキル機能を試すためのサンプルスキル。

## 手順

1. ユーザーに日本語で挨拶する。
2. このスキルが `.claude/skills/hello-world/SKILL.md` から読み込まれたことを伝える。
3. スキルの構成を簡単に説明する:
   - frontmatter の `name`(スキル名)と `description`(いつ使うかの説明)
   - 本文に書いた手順が実行時の指示になること
4. ユーザーに「自分でスキルを作ってみましょう」と促す。
