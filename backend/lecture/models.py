from django.db import models
from user.models import User 
# Create your models here.

# 1. 강의 (Lecture)
class Lecture(models.Model):
    # 상태 관리를 위한 Choice 필드 (대시보드 필터링 용이)
    STATUS_CHOICES = (
        ('RECRUITING', '선생님 배정 중'), # 또는 강사 모집 중
        ('OPEN', '수강 신청 중'),
        ('IN_PROGRESS', '수업 진행 중'), # [추가됨]
        ('CLOSED', '마감'),           # 수업 종료
    )

    name = models.CharField(max_length=255, verbose_name="수업명")
    description = models.TextField(blank=True, null=True) # 강의 설명
    
    # 핵심 변경: 강사가 정해지지 않은 상태로 생성되어야 하므로 null=True 허용
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, # 강사가 탈퇴해도 강의 기록은 남김
        null=True, 
        blank=True,
        related_name="lectures"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RECRUITING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.get_status_display()}] {self.name}"


# 2. 강사 지원 내역 (InstructorApplication)
# 기존 LectureApplication을 구체화하여 강사 지원 전용으로 변경
class LectureApplication(models.Model):
    STATUS_CHOICES = (
        ('PENDING', '대기 중'),
        ('APPROVED', '승인됨'),
        ('REJECTED', '반려됨'),
    )

    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="instructor_applications" # 역참조 이름 변경
    )
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="applied_lectures"
    )
    # 지원 시 강사가 남기는 메시지 (이력, 각오 등)
    message = models.TextField(blank=True, null=True) 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.instructor.username} -> {self.lecture.name} 지원"


# 3. 학생 수강 등록 (Enrollment)
# Registration과 Enrollment를 하나로 통합 (중복 제거)
class Enrollment(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )
    joined_at = models.DateTimeField(auto_now_add=True) # 수강 신청 일시

    class Meta:
        unique_together = ('lecture', 'student') # 중복 수강 방지

    def __str__(self):
        return f"{self.student.username} -> {self.lecture.name}"


# 4. 기타 부가 기능 (유지)
class LectureSchedule(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="schedules")
    start_date = models.DateField()
    def __str__(self):
        return f"{self.lecture.name} 일정"

class LectureNotice(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="notices")
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True) # 이 줄을 추가하세요!

    def __str__(self):
        return f"[{self.lecture.name}] {self.title}"

class Wishlist(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="wishlists")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist_items")

class Attendance(models.Model):
    # 효율성을 위해 정수형으로 관리 (DB 저장값)
    class Status(models.IntegerChoices):
        ABSENT = 0, 'ABSENT'   # 결석
        PRESENT = 1, 'PRESENT' # 출석
        LATE = 2, 'LATE'       # 지각

    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="attendances")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    week = models.IntegerField(default=1) # 주차
    attendance_date = models.DateField()
    
    # 핵심 변경: CharField -> IntegerField
    status = models.IntegerField(
        choices=Status.choices, 
        default=Status.ABSENT
    )

    def __str__(self):
        return f"{self.lecture.name} - {self.week}주차 - {self.get_status_display()}"


# backend/lecture/models.py (기존 코드 아래에 추가)

class Assignment(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    content = models.TextField()
    deadline = models.DateTimeField() # 마감 기한
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.lecture.name}] {self.title}"