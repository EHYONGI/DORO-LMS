from rest_framework import serializers
from .models import Thread, Comment

class ThreadSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = Thread
        fields = ['id', 'title', 'content', 'created_at', 'student_name']
        read_only_fields = ['student'] # 작성자는 자동으로 들어감