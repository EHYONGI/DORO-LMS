from django.db import models
from user.models import User

class Consultation(models.Model):
    # 상태 상수
    STATUS_CHOICES = (
        ('PENDING', '신청완료'),
        ('APPROVED', '상담예정'),
        ('COMPLETED', '상담완료'),
        ('CANCELED', '취소됨'),
    )
    
    # 상담 유형 (수정됨)
    TYPE_CHOICES = (
        ('CAREER', '진로상담'),
        ('CODING', '코딩질문'),
        ('OTHER', '기타'),
    )

    # 상담 형태
    METHOD_CHOICES = (
        ('OFFLINE', '대면상담'),
        ('ONLINE', '비대면상담'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations_as_student')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations_as_instructor')
    
    consultation_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='CAREER')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='OFFLINE')
    
    topic = models.CharField(max_length=200, null=True) 
    content = models.TextField() 
    
    scheduled_at = models.DateTimeField() 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.instructor.username} ({self.status})"