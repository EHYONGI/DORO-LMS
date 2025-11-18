from rest_framework import serializers
from .models import SystemNotice

class SystemNoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username') # 작성자 이름 표시

    class Meta:
        model = SystemNotice
        fields = ['id', 'title', 'content', 'created_at', 'author_name']