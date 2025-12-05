from rest_framework import serializers
from .models import Consultation
from user.models import User


class ConsultationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    # 성 + 이름 조합으로 instructor_name 반환
    instructor_name = serializers.SerializerMethodField()

    # 학생이 신청할 때는 비워두는 필드 → optional
    scheduled_at = serializers.DateTimeField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Consultation
        fields = '__all__'
        # status는 강사가 바꿀 수 있어야 하니까 read_only에 넣지 않음
        read_only_fields = ['student', 'created_at']

        extra_kwargs = {
            # DRF 기본 required=True 덮어쓰기
            'scheduled_at': {
                'required': False,
                'allow_null': True,
            },
            'student': {
                'required': False,
            },
        }

    def get_instructor_name(self, obj):
        # 성(last_name) + 이름(first_name) 조합, 없으면 username
        full_name = f"{obj.instructor.last_name}{obj.instructor.first_name}"
        full_name = full_name.strip()
        return full_name if full_name else obj.instructor.username


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
