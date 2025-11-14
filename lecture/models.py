from django.db import models
from user.models import User 
# Create your models here.

class Lecture(models.Model):
    name = models.CharField(max_length=255)
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="lectures"
    )

    def __str__(self):
        return self.name

class LectureApplication(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="applications"
    )
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="lecture_applications"
    )
    applied = models.TextField(blank=True, null=True)
    received = models.TextField(blank=True, null=True)
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="managed_applications"
    )

    def __str__(self):
        return f"{self.lecture.name} 신청"

class LectureSchedule(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="schedules"
    )
    start_date = models.DateField()

    def __str__(self):
        return f"{self.lecture.name} ({self.start_date})"

class LectureNotice(models.Model):
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="notices"
    )
    title = models.CharField(max_length=255)
    body = models.TextField()

    def __str__(self):
        return f"{self.lecture.name} - {self.title}"

class Wishlist(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="wishlists")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist_items")

class Attendance(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="attendances")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    attendance_date = models.DateField()
    status = models.CharField(max_length=20)

class Registration(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registrations")
    registered_at = models.DateTimeField(auto_now_add=True)

class Enrollment(models.Model):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="enrollments")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")