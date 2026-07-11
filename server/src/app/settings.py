"""環境変数ベースのアプリケーション設定。"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env")

    host: str = "127.0.0.1"
    port: int = 8000
    # 外部アプリに知らせる公開 URL(Agent Card に載る)
    public_url: str = "http://localhost:8000"
    rpc_path: str = "/a2a"


@lru_cache
def get_settings() -> Settings:
    return Settings()
