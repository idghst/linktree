# 파일 목적: core/security.py 단위 테스트
# 주요 기능: hash_password, verify_password, create_access_token, create_refresh_token, verify_token 검증
# 사용 방법: pytest tests/test_services_security.py

from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)


class TestHashPassword:
    def test_returns_hash_string(self):
        """비밀번호 해싱 → 문자열 반환"""
        result = hash_password("mypassword")
        assert isinstance(result, str)
        assert result != "mypassword"

    def test_different_hashes_for_same_password(self):
        """동일 비밀번호도 salt로 다른 해시 생성"""
        h1 = hash_password("mypassword")
        h2 = hash_password("mypassword")
        assert h1 != h2


class TestVerifyPassword:
    def test_correct_password_returns_true(self):
        """올바른 비밀번호 → True"""
        hashed = hash_password("testpassword")
        assert verify_password("testpassword", hashed) is True

    def test_wrong_password_returns_false(self):
        """잘못된 비밀번호 → False"""
        hashed = hash_password("testpassword")
        assert verify_password("wrongpassword", hashed) is False


class TestCreateAccessToken:
    def test_returns_string(self):
        """access token 생성 → 문자열 반환"""
        token = create_access_token("user-123")
        assert isinstance(token, str)

    def test_payload_contains_sub_and_type(self):
        """access token payload에 sub와 type='access' 포함"""
        token = create_access_token("user-123")
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        assert payload["sub"] == "user-123"
        assert payload["type"] == "access"

    def test_token_expires_in_future(self):
        """access token 만료 시간이 현재보다 미래"""
        token = create_access_token("user-123")
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        assert exp > datetime.now(timezone.utc)


class TestCreateRefreshToken:
    def test_returns_string(self):
        """refresh token 생성 → 문자열 반환"""
        token = create_refresh_token("user-123")
        assert isinstance(token, str)

    def test_payload_contains_sub_and_type(self):
        """refresh token payload에 sub와 type='refresh' 포함"""
        token = create_refresh_token("user-123")
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        assert payload["sub"] == "user-123"
        assert payload["type"] == "refresh"

    def test_token_expires_later_than_access(self):
        """refresh token 만료가 access token보다 긴 수명"""
        access = create_access_token("user-123")
        refresh = create_refresh_token("user-123")
        access_payload = jwt.decode(access, settings.secret_key, algorithms=[settings.jwt_algorithm])
        refresh_payload = jwt.decode(refresh, settings.secret_key, algorithms=[settings.jwt_algorithm])
        assert refresh_payload["exp"] > access_payload["exp"]


class TestVerifyToken:
    def test_valid_access_token(self):
        """유효한 access token → sub 반환"""
        token = create_access_token("user-abc")
        result = verify_token(token, token_type="access")
        assert result == "user-abc"

    def test_valid_refresh_token(self):
        """유효한 refresh token → sub 반환"""
        token = create_refresh_token("user-abc")
        result = verify_token(token, token_type="refresh")
        assert result == "user-abc"

    def test_access_token_as_refresh_returns_none(self):
        """access token을 refresh로 검증 → None"""
        token = create_access_token("user-abc")
        result = verify_token(token, token_type="refresh")
        assert result is None

    def test_refresh_token_as_access_returns_none(self):
        """refresh token을 access로 검증 → None"""
        token = create_refresh_token("user-abc")
        result = verify_token(token, token_type="access")
        assert result is None

    def test_expired_token_returns_none(self):
        """만료된 토큰 → None"""
        payload = {
            "sub": "user-abc",
            "type": "access",
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        }
        expired_token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
        result = verify_token(expired_token, token_type="access")
        assert result is None

    def test_invalid_token_string_returns_none(self):
        """유효하지 않은 토큰 문자열 → None"""
        result = verify_token("invalid.token.string", token_type="access")
        assert result is None

    def test_tampered_signature_returns_none(self):
        """서명이 변조된 토큰 → None"""
        token = create_access_token("user-abc")
        tampered = token[:-5] + "XXXXX"
        result = verify_token(tampered, token_type="access")
        assert result is None

    def test_wrong_secret_returns_none(self):
        """잘못된 secret으로 서명된 토큰 → None"""
        payload = {
            "sub": "user-abc",
            "type": "access",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
        }
        bad_token = jwt.encode(payload, "wrong-secret", algorithm=settings.jwt_algorithm)
        result = verify_token(bad_token, token_type="access")
        assert result is None
