---
name: create-worktree
description: 並列作業用に git worktree を新しいブランチで作成する。ベースブランチ prod から 1階層上の workspace 直下 ../<slug> に worktree を切り、移動・片付け方法まで案内する。ユーザーが「worktree を作って」「並列で作業したい」「別ブランチを同時に触りたい」等と言ったときに使う。
argument-hint: "[ブランチ名] [base=prod]"
allowed-tools: Bash(git status:*), Bash(git worktree:*), Bash(git branch:*), Bash(git fetch:*), Bash(git rev-parse:*), Read, Edit
---

# Create Worktree スキル

並列作業のための git worktree を、新しいブランチで作成する。

## 引数

- **ベースブランチ**: `base=<ブランチ名>` や「base は X」等で指定できる。
  指定が無ければデフォルトの `prod` を使う。以降の手順の `<base>` はこの値を指す。

## 手順

1. **ブランチ名を決める**
   - ユーザーの指定がブランチ名(`<type>/<要約>` の kebab-case)ならそのまま使う。
   - 指定がタスクの要約なら、Git ルールに沿って `<type>/<要約>` の kebab-case に変換する
     (例: `feat/add-login`, `fix/css-not-applied`, `chore/update-docs`)。
   - 指定が空なら、何のブランチを作るかユーザーに質問する。
   - `git branch --list <ブランチ名>` で既存ブランチと衝突しないか確認する。

2. **ベースブランチ `<base>` を最新化する**
   - `git rev-parse --verify <base>` で存在を確認する。無ければユーザーに確認する。
   - リモートがあれば `git fetch origin <base>`。無ければスキップ。

3. **配置先を決める**
   - worktree はリポジトリの 1階層上(workspace 直下)の `../<slug>` に置く。
     リポジトリ外なので git 管理対象に入らず、`.gitignore` の追記は不要。
   - `<slug>` はブランチ名の `/` を `-` に置換したもの
     (例: `feat/add-login` → `../feat-add-login`)。

4. **worktree を作成する**
   - `git worktree add -b <ブランチ名> ../<slug> <base>` を実行する。

5. **作成結果を案内する**
   - 移動: `cd ../<slug>`
   - 一覧: `git worktree list`
   - 片付け(作業完了後): `git worktree remove ../<slug>`

## 注意

- ベースはデフォルト `prod`。引数(`base=<ブランチ名>`)で変更できる。
- 既存ブランチ名・既存 worktree パスと衝突する場合は上書きせず、別名をユーザーに確認する。
- worktree の削除(`git worktree remove`)は不可逆なので、このスキルでは作成のみ行い、
  片付けは案内にとどめる。ユーザーが明示的に依頼したときだけ削除する。
