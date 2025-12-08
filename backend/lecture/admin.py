from django.contrib import admin
from .models import Lecture, LectureApplication, LectureSchedule, LectureNotice, Wishlist, Attendance, Enrollment, Assignment

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