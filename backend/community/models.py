from django.db import models
from user.models import User
from lecture.models import Lecture # Lecture 모델 import

class Thread(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    student = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
        related_name="threads"
    )
    # 어떤 강의의 게시판인지 구분 (Null이면 전체 게시판)
    lecture = models.ForeignKey(
        Lecture,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="threads"
    )

    def __str__(self):
        return self.title

# Comment 모델은 그대로 유지
class Comment(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    student = models.ForeignKey(
        User,
        null=True,
        on_delete=models.CASCADE,
        related_name="my_comments"
    )
    thread = models.ForeignKey(
        'Thread',
        on_delete=models.CASCADE,
        related_name="comments"
    )