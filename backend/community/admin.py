from django.contrib import admin
from .models import Comment, Thread

# Register your models here.
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    pass

@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    pass