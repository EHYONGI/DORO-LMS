from django.contrib import admin
from .models import (
    Lecture, LectureApplication, LectureSchedule, LectureNotice, 
    Wishlist, Attendance, Enrollment, Assignment, Submission  # Submission으로 변경
)

# Register your models here.
@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    pass

@admin.register(LectureApplication)
class LectureApplicationAdmin(admin.ModelAdmin):
    pass

@admin.register(LectureSchedule)
class LectureScheduleAdmin(admin.ModelAdmin):
    pass

@admin.register(LectureNotice)
class LectureNoticeAdmin(admin.ModelAdmin):
    pass

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    pass

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    pass

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    pass

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    pass

@admin.register(Submission)  # Submission으로 변경
class SubmissionAdmin(admin.ModelAdmin):  # 클래스명도 변경
    list_display = ['assignment', 'student', 'submitted_at', 'grade']
    list_filter = ['assignment__lecture', 'submitted_at']