from celery import Celery
from config.config import REDIS_URL

celery = Celery(
    "executor",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tools.codeexecutor.codeexecutor"]
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    result_expires=3600
)