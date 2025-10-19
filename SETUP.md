# Python環境構築手順（uv使用）

このプロジェクトでは、Pythonのバージョン管理とパッケージ管理に`uv`を使用します。

## 前提条件

- macOS、Linux、またはWSL2環境
- curl がインストールされていること

## 1. uvのインストール

### macOS/Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### インストール後の設定

シェルの設定ファイルにパスを追加（自動的に追加されますが、念のため確認）

```bash
source $HOME/.cargo/env
```

### インストール確認

```bash
uv --version
```

## 2. Pythonのインストール

```bash
# 最新の安定版をインストール
uv python install

# 特定のバージョンをインストール（推奨: 3.12）
uv python install 3.12

# インストール済みのバージョンを確認
uv python list
```

## 3. プロジェクトのセットアップ

### プロジェクトディレクトリに移動

```bash
cd /path/to/claude-code-sandbox
```

### プロジェクトの初期化

```bash
# pyproject.tomlを作成（まだない場合）
uv init

# Pythonバージョンを固定
uv python pin 3.12
```

### 仮想環境の作成

```bash
# 仮想環境を作成（.venvディレクトリが作成される）
uv venv

# または特定のPythonバージョンで作成
uv venv --python 3.12
```

## 4. パッケージのインストール

### 必要なパッケージをインストール

```bash
# 個別にインストール
uv pip install requests numpy pandas

# requirements.txtから一括インストール（ファイルがある場合）
uv pip install -r requirements.txt

# pyproject.tomlに依存関係を追加してインストール
uv add requests numpy pandas
```

## 5. 仮想環境の有効化

### macOS/Linux

```bash
source .venv/bin/activate
```

### Windows（PowerShell）

```bash
.venv\Scripts\Activate.ps1
```

### 仮想環境の無効化

```bash
deactivate
```

## 6. スクリプトの実行

### uvを使って実行（推奨）

```bash
# 仮想環境を自動的に使用
uv run python main.py

# スクリプトに引数を渡す
uv run python script.py --arg value
```

### 通常のPythonコマンドで実行

```bash
# 仮想環境を有効化してから
source .venv/bin/activate
python main.py
```

## 7. よく使うコマンド

```bash
# パッケージの追加
uv add package-name

# パッケージの削除
uv remove package-name

# インストール済みパッケージの一覧
uv pip list

# パッケージのアップデート
uv pip install --upgrade package-name

# 仮想環境の再作成
rm -rf .venv
uv venv
```

## トラブルシューティング

### uvコマンドが見つからない

```bash
# パスを再読み込み
source $HOME/.cargo/env

# またはシェルを再起動
exec $SHELL
```

### Pythonバージョンの切り替え

```bash
# 別のバージョンをインストール
uv python install 3.11

# プロジェクトで使用するバージョンを変更
uv python pin 3.11

# 仮想環境を再作成
rm -rf .venv
uv venv
```

### パッケージのインストールに失敗する

```bash
# キャッシュをクリア
uv cache clean

# 再度インストール
uv pip install package-name
```

## 参考リンク

- [uv公式ドキュメント](https://docs.astral.sh/uv/)
- [uvGitHubリポジトリ](https://github.com/astral-sh/uv)

## 次のステップ

環境構築が完了したら、以下を確認してください:

1. `.python-version`ファイルが作成されているか
2. `.venv`ディレクトリが作成されているか
3. `pyproject.toml`が存在するか
4. `uv run python --version`で正しいバージョンが表示されるか
