"""構造化ログ(JsonFormatter)の単体テスト。"""

import json
import logging

from app.logging_config import JsonFormatter


def _record(msg: str, extra: dict | None = None) -> logging.LogRecord:
    record = logging.LogRecord(
        name="app.test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg=msg,
        args=None,
        exc_info=None,
    )
    for key, value in (extra or {}).items():
        setattr(record, key, value)
    return record


def test_format_is_valid_json_with_base_fields() -> None:
    payload = json.loads(JsonFormatter().format(_record("hello")))
    assert payload["message"] == "hello"
    assert payload["level"] == "INFO"
    assert payload["logger"] == "app.test"
    assert "timestamp" in payload


def test_extra_fields_are_included() -> None:
    payload = json.loads(
        JsonFormatter().format(_record("invoked", {"task_id": "t-1", "context_id": "c-1"}))
    )
    assert payload["task_id"] == "t-1"
    assert payload["context_id"] == "c-1"


def test_exception_is_serialized() -> None:
    try:
        raise ValueError("boom")
    except ValueError:
        import sys

        record = _record("failed")
        record.exc_info = sys.exc_info()

    payload = json.loads(JsonFormatter().format(record))
    assert "ValueError: boom" in payload["exc_info"]
