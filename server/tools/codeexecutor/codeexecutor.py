from helper.celery_app import celery
from helper.executor_task import execute_code

@celery.task(bind=True)
def execute_code_task(self, code: str, lang: str, timeout: int=10):
    try:
        self.update_state(state="STARTED", meta={"status": "Executing code..."})
        result = execute_code(code, lang, timeout)
        return {"status":"success", "result": result}
    except Exception as e:
        return {"status":"error", "message":str(e)}