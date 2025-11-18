from rest_framework import serializers
from .models import Lecture, Enrollment, Assignment, LectureNotice, Attendance

# 1. 강의 정보 시리얼라이저
class LectureSerializer(serializers.ModelSerializer):
    # instructor는 User 객체이므로, 이름(username)만 보내주기 위해 커스텀 필드 사용
    instructor_name = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = Lecture
        fields = ['id', 'name', 'instructor_name', 'status', 'description']

# 2. 수강 내역 시리얼라이저 (내 강의 목록용)
class EnrollmentSerializer(serializers.ModelSerializer):
    lecture = LectureSerializer(read_only=True) # 수강 내역 안에 강의 상세 정보 포함

    class Meta:
        model = Enrollment
        fields = ['lecture', 'joined_at']

# 3. 과제 시리얼라이저 (강의별 과제 현황용)
class AssignmentSerializer(serializers.ModelSerializer):
    lecture_name = serializers.ReadOnlyField(source='lecture.name')

    class Meta:
        model = Assignment
        fields = ['id', 'lecture_name', 'title', 'deadline', 'content']


class LectureNoticeSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='body') 
    lecture_name = serializers.ReadOnlyField(source='lecture.name')
    author_name = serializers.ReadOnlyField(source='lecture.instructor.username')
    
    class Meta:
        model = LectureNotice
        # 'lecture' (ID) 필드 추가!
        fields = ['id', 'title', 'content', 'created_at', 'lecture_name', 'author_name', 'lecture']

class AttendanceSerializer(serializers.ModelSerializer):
    # DB에는 정수(0,1,2)가 저장되어 있지만, 
    # API로 나갈 때는 'PRESENT', 'LATE' 같은 문자열(label)로 변환해서 보냄
    status = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'week', 'attendance_date', 'status']