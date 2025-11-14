from django.contrib import admin
from .models import LectureNotice, SystemNotice

# Register your models here.
@admin.register(LectureNotice)
class LectureNoticeAdmin(admin.ModelAdmin):
    pass

@admin.register(SystemNotice)
class SystemNoticeAdmin(admin.ModelAdmin):
    pass