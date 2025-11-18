from django.contrib import admin
from .models import SystemNotice

# Register your models here.
@admin.register(SystemNotice)
class SystemNoticeAdmin(admin.ModelAdmin):
    pass