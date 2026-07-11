"""構造化ログ(標準 logging + JSON フォーマット)の設定。

アプリ全体でこのフォーマッタを使い、ログを 1 行 1 JSON で出力する。
外部アプリ呼び出しの追跡に必要な task_id / context_id などは
`logger.info(..., extra={...})` で渡すと JSON のフィールドとして載る。
"""

import datetime as dt
import json
import logging
from typing import Any

# LogRecord が標準で持つ属性名。これ以外を extra 由来の追加フィールドとして扱う。
_RESERVED = frozenset(logging.LogRecord("", 0, "", 0, "", None, None).__dict__)


class JsonFormatter(logging.Formatter):
    """LogRecord を 1 行の JSON にするフォーマッタ。"""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": dt.datetime.fromtimestamp(record.created, tz=dt.UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # extra= で渡された追加フィールドを載せる。
        for key, value in record.__dict__.items():
            if key not in _RESERVED and not key.startswith("_"):
                payload[key] = value
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def setup_logging(level: str = "INFO") -> None:
    """ルートロガーに JSON ハンドラを設定する(冪等)。"""
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())
