# claude-code-sandbox

Claude Code を試すためのサンドボックス。自由に実験してよい。

## ルール

プロジェクトのルールは `.claude/rules/` に分割して定義し、ここから読み込む。

@.claude/rules/general.md
@.claude/rules/git.md

## ディレクトリ構成

- `.claude/rules/` — プロジェクトルール(このファイルから `@` で読み込む)
- `.claude/commands/` — スラッシュコマンド(`/explain`, `/commit` など)
- `.claude/skills/` — スキル(`SKILL.md` 単位で定義)
