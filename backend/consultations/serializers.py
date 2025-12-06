from rest_framework import serializers
from .models import Consultation
from user.models import User

class ConsultationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ['student', 'created_at']

    def get_student_name(self, obj):
        # 성(last_name) + 이름(first_name) 조합. 없으면 아이디(username) 사용
        full_name = f"{obj.student.last_name}{obj.student.first_name}"
        return full_name if full_name.strip() else obj.student.username

    def get_instructor_name(self, obj):
        # 성(last_name) + 이름(first_name) 조합. 없으면 아이디(username) 사용
        full_name = f"{obj.instructor.last_name}{obj.instructor.first_name}"
        return full_name if full_name.strip() else obj.instructor.username

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']