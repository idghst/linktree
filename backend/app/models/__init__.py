# 파일 목적: models 패키지 초기화 및 모든 모델 export
# 주요 기능: User, Link, ProfileView, LinkClick 모델 import
# 사용 방법: from app.models import User, Link, ProfileView, LinkClick

from app.models.user import User
from app.models.link import Link
from app.models.analytics import ProfileView, LinkClick

__all__ = ["User", "Link", "ProfileView", "LinkClick"]
