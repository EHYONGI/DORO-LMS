from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        (0, 'Manager'),
        (1, 'Student'),
        (2, 'Instructor'),
    )
    
    phone = models.CharField(max_length=20, unique=True, verbose_name='전화번호')
    birth = models.DateField(blank=True, null=True, verbose_name='생년월일')
    role = models.IntegerField(choices=ROLE_CHOICES, default=1, verbose_name='역할')
    interests = models.CharField(max_length=255, blank=True, null=True, verbose_name="관심분야")

    digital_score = models.IntegerField(default=0, verbose_name='디지털 역량')
    ai_score = models.IntegerField(default=0, verbose_name='인공지능 역량')
    making_score = models.IntegerField(default=0, verbose_name='메이킹 역량')
    computing_score = models.IntegerField(default=0, verbose_name='컴퓨팅 역량')

    def __str__(self):
        return self.username
    
    def get_competency_scores(self):
        """역량 점수 딕셔너리 반환"""
        return {
            'D': self.digital_score,
            'I': self.ai_score,
            'M': self.making_score,
            'C': self.computing_score,
        }