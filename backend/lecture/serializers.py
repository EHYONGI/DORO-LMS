from rest_framework import serializers
from .models import Lecture, Enrollment, Assignment, LectureNotice, Attendance

# 1. 강의 정보 시리얼라이저
class LectureSerializer(serializers.ModelSerializer):
    # instructor_name 필드 유지
    instructor_name = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = Lecture
        # 모델에 실제로 존재하는 필드만 포함시킵니다.
        fields = ['id', 'name', 'instructor_name', 'status', 'description']

# 2. 수강 내역 시리얼라이저 (내 강의 목록용)
class EnrollmentSerializer(serializers.ModelSerializer):
    lecture = LectureSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'lecture', 'joined_at'] # id 필드도 포함하는 것이 좋습니다.

# 3. 과제 시리얼라이저
class AssignmentSerializer(serializers.ModelSerializer):
    lecture_name = serializers.ReadOnlyField(source='lecture.name')

    class Meta:
        model = Assignment
        fields = ['id', 'lecture_name', 'title', 'deadline', 'content']

# 4. 강의 공지 시리얼라이저
class LectureNoticeSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='body') 
    lecture_name = serializers.ReadOnlyField(source='lecture.name')
    author_name = serializers.ReadOnlyField(source='lecture.instructor.username')
    
    class Meta:
        model = LectureNotice
        fields = ['id', 'title', 'content', 'created_at', 'lecture_name', 'author_name', 'lecture']

# 5. 출결 시리얼라이저
class AttendanceSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'week', 'attendance_date', 'status']