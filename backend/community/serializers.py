from rest_framework import serializers
from .models import Thread, Comment

# 1. 게시글 목록용
class ThreadSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = Thread
        fields = ['id', 'title', 'content', 'created_at', 'student_name', 'lecture']
        read_only_fields = ['student']

# 2. 댓글용
class CommentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'student_name']

# 3. 게시글 상세 조회용 (댓글 포함)
class ThreadDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    
    # models.py의 related_name="comments"와 일치해야 합니다.
    comments = CommentSerializer(many=True, read_only=True) 

    class Meta:
        model = Thread
        # comments 필드가 반드시 포함되어야 합니다.
        fields = ['id', 'title', 'content', 'created_at', 'student_name', 'comments']