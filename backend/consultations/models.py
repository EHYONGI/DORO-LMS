from django.db import models

# Create your models here.
from user.models import User 

class Consultation(models.Model):
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='consultations_instructor'
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='consultations_student'
    )
    request_datetime = models.DateTimeField()
    status = models.CharField(max_length=20)
    content = models.TextField()

    def __str__(self):
        return f"{self.student.name} -> {self.instructor.name} | {self.status}"