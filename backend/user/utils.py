# backend/user/utils.py
import string
import random

def generate_random_password(length=10):
    """10자리 랜덤 임시 비밀번호 생성"""
    chars = string.ascii_letters + string.digits + "!@#$"
    return ''.join(random.choice(chars) for _ in range(length))