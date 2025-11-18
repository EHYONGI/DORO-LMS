from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        (0, 'Manager'),
        (1, 'Student'),
        (2, 'Instructor'),
    )
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True, verbose_name='전화번호')
    birth = models.DateField(blank=True, null=True, verbose_name='생년월일')
    role = models.IntegerField(choices=ROLE_CHOICES, default=0, verbose_name='역할')
    def __str__(self):
        return self.username