from rest_framework import serializers
from .models import Consultation
from user.models import User


class ConsultationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    instructor_name = serializers.SerializerMethodField()
    scheduled_at = serializers.DateTimeField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ['student', 'created_at']

        extra_kwargs = {
            'scheduled_at': {
                'required': False,
                'allow_null': True,
            },
            'student': {
                'required': False,
            },
        }

    def get_instructor_name(self, obj):
        full_name = f"{obj.instructor.last_name}{obj.instructor.first_name}"
        full_name = full_name.strip()
        return full_name if full_name else obj.instructor.username


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
