from django.db import models
from user.models import User


# ==========================================
# 1. 강의 (Lecture)
# ==========================================
class Lecture(models.Model):
    STATUS_CHOICES = (
        ('RECRUITING', '선생님 배정 중'),
        ('OPEN', '수강 신청 중'),
        ('IN_PROGRESS', '수업 진행 중'),
        ('CLOSED', '마감'),
    )
    
    COMPETENCY_CHOICES = (
        ('D', '디지털'),
        ('I', '인공지능'),
        ('M', '메이킹'),
        ('C', '컴퓨팅'),
    )
    
    LEVEL_CHOICES = (
        ('common', '공통'),
        ('basic', '기초'),
        ('intermediate', '중급'),
        ('advanced', '심화'),
    )

    # 기본 정보
    name = models.CharField(max_length=255, verbose_name='수업명')
    description = models.TextField(blank=True, null=True, verbose_name='설명')
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='lectures',
        verbose_name='강사'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='RECRUITING',
        verbose_name='상태'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    # 커리큘럼 메타데이터
    course_code = models.CharField(
        max_length=20, 
        unique=True, 
        blank=True, 
        null=True,
        verbose_name='강의 코드'
    )
    competency_type = models.CharField(
        max_length=1, 
        choices=COMPETENCY_CHOICES,
        blank=True,
        null=True,
        verbose_name='역량 타입'
    )
    level = models.CharField(
        max_length=15, 
        choices=LEVEL_CHOICES,
        default='basic',
        verbose_name='난이도'
    )
    required_score = models.IntegerField(
        default=0,
        verbose_name='최소 요구 점수'
    )
    learning_tools = models.TextField(
        blank=True, 
        null=True,
        verbose_name='학습 도구'
    )
    required_kits = models.TextField(
        blank=True, 
        null=True,
        verbose_name='필요 키트'
    )
    prerequisite_lectures = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='next_lectures',
        verbose_name='선수과목'
    )

    class Meta:
        db_table = 'lecture'
        verbose_name = '강의'
        verbose_name_plural = '강의'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_status_display()}] {self.name}"
    
    def is_eligible_for_user(self, user):
        """사용자가 이 강의를 수강할 수 있는지 확인"""
        if not self.competency_type:
            return True
        user_score = user.get_competency_scores().get(self.competency_type, 0)
        return user_score >= self.required_score
    
    def get_recommendation_score(self, user):
        """사용자에게 이 강의의 추천 점수 계산"""
        if not self.competency_type:
            return 50.0
        
        user_score = user.get_competency_scores().get(self.competency_type, 0)
        if user_score < self.required_score:
            return 0.0
        
        excess = user_score - self.required_score
        base_score = 50 + (excess * 0.5)
        if 5 <= excess <= 20:
            base_score += 20
        
        return min(base_score, 100.0)


# ==========================================
# 2. 강의 추천 기록 (LectureRecommendation)
# ==========================================
class LectureRecommendation(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lecture_recommendations',
        verbose_name='사용자'
    )
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='recommendations',
        verbose_name='강의'
    )
    recommendation_score = models.FloatField(verbose_name='추천 점수')
    reason = models.TextField(verbose_name='추천 이유')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        db_table = 'lecture_recommendation'
        verbose_name = '강의 추천'
        verbose_name_plural = '강의 추천'
        ordering = ['-recommendation_score', '-created_at']
        unique_together = ('user', 'lecture')
    
    def __str__(self):
        return f"{self.user.username} → {self.lecture.name} ({self.recommendation_score}점)"


# ==========================================
# 3. 강사 지원 내역 (LectureApplication)
# ==========================================
class LectureApplication(models.Model):
    STATUS_CHOICES = (
        ('PENDING', '대기 중'),
        ('APPROVED', '승인됨'),
        ('REJECTED', '반려됨'),
    )

    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='instructor_applications',
        verbose_name='강의'
    )
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='applied_lectures',
        verbose_name='강사'
    )
    message = models.TextField(blank=True, null=True, verbose_name='지원 메시지')
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PENDING',
        verbose_name='상태'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='지원일')

    class Meta:
        db_table = 'lecture_application'
        verbose_name = '강사 지원'
        verbose_name_plural = '강사 지원'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.instructor.username} → {self.lecture.name} 지원"


# ==========================================
# 4. 수강 신청 (Enrollment)
# ==========================================
class Enrollment(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='강의'
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='학생'
    )
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name='수강 신청일')

    class Meta:
        db_table = 'enrollment'
        verbose_name = '수강 신청'
        verbose_name_plural = '수강 신청'
        unique_together = ('lecture', 'student')
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.student.username} → {self.lecture.name}"


# ==========================================
# 5. 강의 스케줄 (LectureSchedule)
# ==========================================
class LectureSchedule(models.Model):
    lecture = models.ForeignKey(
        Lecture, 
        on_delete=models.CASCADE, 
        related_name='schedules',
        verbose_name='강의'
    )
    start_date = models.DateField(verbose_name='시작일')
    end_date = models.DateField(blank=True, null=True, verbose_name='종료일')
    
    class Meta:
        db_table = 'lecture_schedule'
        verbose_name = '강의 스케줄'
        verbose_name_plural = '강의 스케줄'
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.lecture.name} - {self.start_date}"


# ==========================================
# 6. 강의 공지사항 (LectureNotice)
# ==========================================
class LectureNotice(models.Model):
    lecture = models.ForeignKey(
        Lecture, 
        on_delete=models.CASCADE, 
        related_name='lecture_notices',
        verbose_name='강의'
    )
    title = models.CharField(max_length=255, verbose_name='제목')
    body = models.TextField(verbose_name='내용')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')

    class Meta:
        db_table = 'lecture_notice'
        verbose_name = '강의 공지사항'
        verbose_name_plural = '강의 공지사항'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.lecture.name}] {self.title}"


# ==========================================
# 7. 관심 강의 (Wishlist)
# ==========================================
class Wishlist(models.Model):
    lecture = models.ForeignKey(
        Lecture, 
        on_delete=models.CASCADE, 
        related_name='wishlists',
        verbose_name='강의'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='wishlist_items',
        verbose_name='사용자'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='추가일')
    
    class Meta:
        db_table = 'wishlist'
        verbose_name = '관심 강의'
        verbose_name_plural = '관심 강의'
        unique_together = ('lecture', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} → {self.lecture.name}"


# ==========================================
# 8. 출결 (Attendance)
# ==========================================
class Attendance(models.Model):
    class Status(models.IntegerChoices):
        ABSENT = 0, '결석'
        PRESENT = 1, '출석'
        LATE = 2, '지각'
    
    lecture = models.ForeignKey(
        Lecture, 
        on_delete=models.CASCADE, 
        related_name='attendances',
        verbose_name='강의'
    )
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='attendances',
        verbose_name='학생'
    )
    week = models.IntegerField(verbose_name='주차')
    status = models.IntegerField(
        choices=Status.choices, 
        default=Status.PRESENT, 
        verbose_name='출결 상태'
    )
    attendance_date = models.DateField(verbose_name='출결일')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='기록일')
    
    class Meta:
        db_table = 'attendance'
        verbose_name = '출결'
        verbose_name_plural = '출결'
        unique_together = ['lecture', 'student', 'week']
        ordering = ['week', 'student']
    
    def __str__(self):
        return f"{self.lecture.name} - {self.student.username} - {self.week}주차"


# ==========================================
# 9. 과제 (Assignment)
# ==========================================
class Assignment(models.Model):
    lecture = models.ForeignKey(
        Lecture, 
        on_delete=models.CASCADE, 
        related_name='assignments',
        verbose_name='강의'
    )
    title = models.CharField(max_length=200, verbose_name='과제 제목')
    description = models.TextField(verbose_name='과제 설명')
    due_date = models.DateTimeField(verbose_name='마감일')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        db_table = 'assignment'
        verbose_name = '과제'
        verbose_name_plural = '과제'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"[{self.lecture.name}] {self.title}"


# ==========================================
# 10. 과제 제출 (Submission)
# ==========================================
class Submission(models.Model):
    assignment = models.ForeignKey(
        Assignment, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        verbose_name='과제'
    )
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        verbose_name='학생'
    )
    content = models.TextField(verbose_name='제출 내용')
    file_url = models.URLField(blank=True, null=True, verbose_name='첨부 파일 URL')
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='제출일')
    grade = models.IntegerField(blank=True, null=True, verbose_name='점수')
    feedback = models.TextField(blank=True, null=True, verbose_name='피드백')
    graded_at = models.DateTimeField(blank=True, null=True, verbose_name='채점일')
    
    class Meta:
        db_table = 'submission'
        verbose_name = '과제 제출'
        verbose_name_plural = '과제 제출'
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.assignment.title} - {self.student.username}"