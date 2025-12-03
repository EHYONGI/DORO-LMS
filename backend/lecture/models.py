from django.db import models
from user.models import User 
# Create your models here.

# 1. 강의 (Lecture)
class Lecture(models.Model):
    STATUS_CHOICES = (
        ('RECRUITING', '선생님 배정 중'),
        ('OPEN', '수강 신청 중'),
        ('IN_PROGRESS', '수업 진행 중'),
        ('CLOSED', '마감'),
    )
    
    # [추가] 역량 타입
    COMPETENCY_CHOICES = (
        ('D', '디지털'),
        ('I', '인공지능'),
        ('M', '메이킹'),
        ('C', '컴퓨팅'),
    )
    
    # [추가] 난이도
    LEVEL_CHOICES = (
        ('common', '공통'),
        ('basic', '기초'),
        ('intermediate', '중급'),
        ('advanced', '심화'),
    )

    name = models.CharField(max_length=255, verbose_name="수업명")
    description = models.TextField(blank=True, null=True)
    
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name="lectures"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RECRUITING')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # [추가] 커리큘럼 메타데이터
    course_code = models.CharField(
        max_length=20, 
        unique=True, 
        blank=True, 
        null=True,
        verbose_name="강의 코드"
    )  # 예: C1-기초-1
    
    competency_type = models.CharField(
        max_length=1, 
        choices=COMPETENCY_CHOICES,
        blank=True,
        null=True,
        verbose_name="역량 타입"
    )
    
    level = models.CharField(
        max_length=15, 
        choices=LEVEL_CHOICES,
        default='basic',
        verbose_name="난이도"
    )
    
    # [추가] 추천 시스템용 필드
    required_score = models.IntegerField(
        default=0,
        verbose_name="최소 요구 점수"
    )  # 해당 역량의 최소 점수
    
    learning_tools = models.TextField(
        blank=True, 
        null=True,
        verbose_name="학습 도구"
    )  # 예: "엔트리, 코드모스"
    
    required_kits = models.TextField(
        blank=True, 
        null=True,
        verbose_name="필요 키트"
    )  # 예: "아두이노 게임기 키트"
    
    # [추가] 선수과목
    prerequisite_lectures = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='next_lectures',
        verbose_name="선수과목"
    )

    def __str__(self):
        return f"[{self.get_status_display()}] {self.name}"
    
    def is_eligible_for_user(self, user):
        """사용자가 이 강의를 수강할 수 있는지 확인"""
        if not self.competency_type:
            return True  # 역량 타입 미설정 시 누구나 가능
        
        user_score = user.get_competency_scores().get(self.competency_type, 0)
        return user_score >= self.required_score
    
    def get_recommendation_score(self, user):
        """사용자에게 이 강의의 추천 점수 계산"""
        if not self.competency_type:
            return 50.0
        
        user_score = user.get_competency_scores().get(self.competency_type, 0)
        
        if user_score < self.required_score:
            return 0.0  # 자격 미달
        
        # 초과 점수에 따른 점수 계산
        excess = user_score - self.required_score
        base_score = 50 + (excess * 0.5)
        
        # 적정 난이도 보너스 (5~20점 초과가 가장 적합)
        if 5 <= excess <= 20:
            base_score += 20
        
        return min(base_score, 100.0)


# [추가] 강의 추천 기록 모델
class LectureRecommendation(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lecture_recommendations'
    )
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    recommendation_score = models.FloatField(verbose_name="추천 점수")
    reason = models.TextField(verbose_name="추천 이유")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recommendation_score', '-created_at']
        unique_together = ('user', 'lecture')
    
    def __str__(self):
        return f"{self.user.username} -> {self.lecture.name} ({self.recommendation_score}점)"


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