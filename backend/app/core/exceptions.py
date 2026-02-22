# 파일 목적: 애플리케이션 전용 예외 클래스 계층 정의
# 주요 기능: AppException 기반 - NotFound, BadRequest, Unauthorized, Conflict, Forbidden
# 사용 방법: from app.core.exceptions import NotFoundException, UnauthorizedException

from fastapi import status


class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class NotFoundException(AppException):
    def __init__(self, detail: str = "리소스를 찾을 수 없습니다."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class BadRequestException(AppException):
    def __init__(self, detail: str = "잘못된 요청입니다."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "인증이 필요합니다."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ConflictException(AppException):
    def __init__(self, detail: str = "이미 존재하는 리소스입니다."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ForbiddenException(AppException):
    def __init__(self, detail: str = "접근 권한이 없습니다."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
