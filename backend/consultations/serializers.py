from rest_framework import serializers
from .models import Consultation
from user.models import User

class ConsultationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    # instructor_name을 커스텀 메서드로 변경하여 성+이름 조합으로 반환
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ['student', 'created_at'] # status는 수정 가능해야 하므로 read_only에서 제외

    def get_instructor_name(self, obj):
        # 성(last_name) + 이름(first_name) 조합. 없으면 아이디(username) 사용
        full_name = f"{obj.instructor.last_name}{obj.instructor.first_name}"
        return full_name if full_name.strip() else obj.instructor.username

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']