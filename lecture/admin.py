from django.contrib import admin
from .models import Lecture, LectureApplication, LectureSchedule

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