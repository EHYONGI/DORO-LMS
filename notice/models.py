from django.db import models
from user.models import User
from lecture.models import Lecture

# Create your models here.

class SystemNotice(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="system_notices",
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class LectureNotice(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="lecture_notice"
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.lecture.name} - {self.title}"
