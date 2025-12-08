from rest_framework import serializers
from .models import Thread, Comment

# 1. 게시글 목록용
class ThreadSerializer(serializers.ModelSerializer):
    # 기존: student_name = serializers.ReadOnlyField(source='student.username')
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ['id', 'title', 'content', 'created_at', 'student_name', 'lecture']
        read_only_fields = ['student']

    def get_student_name(self, obj):
        if not obj.student:
            return "알 수 없음"
        full_name = f"{obj.student.last_name}{obj.student.first_name}".strip()
        return full_name if full_name else obj.student.username

# 2. 댓글용
class CommentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'student_name']

    def get_student_name(self, obj):
        if not obj.student:
            return "알 수 없음"
        full_name = f"{obj.student.last_name}{obj.student.first_name}".strip()
        return full_name if full_name else obj.student.username

# 3. 게시글 상세 조회용 (댓글 포함)
class ThreadDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True) 

    class Meta:
        model = Thread
        fields = ['id', 'title', 'content', 'created_at', 'student_name', 'comments']

    def get_student_name(self, obj):
        if not obj.student:
            return "알 수 없음"
        full_name = f"{obj.student.last_name}{obj.student.first_name}".strip()
        return full_name if full_name else obj.student.username