from django.db import models
from user.models import User

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
