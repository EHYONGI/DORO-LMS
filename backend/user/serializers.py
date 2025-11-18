from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. 회원가입
class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

# 2. 내 정보 조회/수정 (에러 방지용 수동 정의)
class UserProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True) # 아이디는 수정 불가
    email = serializers.EmailField()
    date_joined = serializers.DateTimeField(read_only=True)

    def update(self, instance, validated_data):
        # 이메일 등 수정 가능한 필드만 업데이트
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance

# 3. 비밀번호 찾기 (이메일 확인용)
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()