# backend/user/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. 회원가입 (이름, 생년월일 추가)
class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'birth']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            birth=validated_data.get('birth', None)
        )
        return user

# 2. 내 정보 조회/수정 (이름, 생년월일 포함)
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # interests 필드 추가
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'birth', 'phone', 'date_joined', 'role', 'interests']
        read_only_fields = ['id', 'username', 'date_joined', 'role']

# 3. 비밀번호 찾기 (유지)
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()