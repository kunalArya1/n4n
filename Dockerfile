FROM python:3.11-slim

WORKDIR /app

ENV PYTHONPATH=/app/server

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app
COPY . .

RUN groupadd -g 999 docker || true
RUN usermod -aG docker root

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]