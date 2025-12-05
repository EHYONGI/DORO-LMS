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

    # 상담 유형
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

    # 누가 누구에게 신청했는지
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='consultations_as_student',
    )
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='consultations_as_instructor',
    )

    # 기본 정보
    consultation_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='CAREER',
    )
    method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        default='OFFLINE',
    )

    topic = models.CharField(max_length=200, null=True)
    content = models.TextField()

    # ✅ 학생이 신청할 때 적는 "희망 상담 일자"
    preferred_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="희망 상담 일자",
    )

    # ✅ 실제 상담이 확정된 날짜+시간
    scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="실제 상담 일시",
    )

    # ✅ 상담 상태
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
    )

    # 생성 시각
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.instructor.username} ({self.status})"
