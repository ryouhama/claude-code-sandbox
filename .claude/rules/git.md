# Git ルール

## コミット

- コミットメッセージは Conventional Commits 形式(`feat:`, `fix:`, `chore:`, `docs:`, `refactor:` など)。
- 1コミットは論理的にまとまった単位で小さく保つ。

## ブランチ

- `prod` ブランチへ直接作業する場合を除き、作業前にブランチを切る。
- `prod` / `main` へは直接コミット・push しない。変更は必ず PR 経由で取り込む。
- ブランチ名は `<type>/<要約>` の kebab-case。`<type>` は Conventional Commits の type に合わせる。
  - 例: `feat/add-login`, `fix/css-not-applied`, `chore/update-docs`, `docs/update-readme`, `refactor/extract-service`, `test/add-editor-spec`。
- 1ブランチ = 1つの論理的な変更。用途が異なる変更は別ブランチに分ける。

## PR

- ベースブランチは `prod`(`main` を明示指定された場合を除く)。
- PR タイトルは Conventional Commits 形式。
- PR 本文は以下のテンプレートに沿う。

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
