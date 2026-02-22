# 파일 목적: 백엔드 FastAPI 서버 Docker 이미지 빌드
# 주요 기능: Python 3.12-slim 기반, requirements 설치, uvicorn 실행
# 사용 방법: docker build -t linktree-backend ./backend

FROM python:3.12-slim

WORKDIR /app

# 의존성 파일만 먼저 복사 (레이어 캐시 활용)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 마이그레이션 후 서버 실행
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
