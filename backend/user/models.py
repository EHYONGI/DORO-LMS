from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        (0, 'Manager'),
        (1, 'Student'),
        (2, 'Instructor'),
    )
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name='전화번호')
    birth = models.DateField(blank=True, null=True, verbose_name='생년월일')
    role = models.IntegerField(choices=ROLE_CHOICES, default=0, verbose_name='역할')
    
    # [추가] 관심 분야 (쉼표로 구분하여 저장하거나 별도 모델 분리 가능, 여기선 간단히 텍스트로 저장)
    interests = models.CharField(max_length=255, blank=True, null=True, verbose_name="관심분야")

    def __str__(self):
        return self.username