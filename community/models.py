from django.db import models

# Create your models here.
class Thread(models.Model):
    ## primary key (id)는 자동으로 만들어지기 때문에 따로 설정 안함
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # student_id = models.ForeignKey(
    #     'Students',
    #     on_delete=models.CASCADE,
    #     related_name="thread"
    # )
    def __str__(self):
        return self.title

class Comment(models.Model):
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # student_id = models.ForeignKey(
    #     'Student',
    #     on_delete=models.CASCADE,
    #     related_name="comment"
    # )
    thread_id = models.ForeignKey(
        'Thread',
        on_delete=models.CASCADE,
        related_name="comment"
    )