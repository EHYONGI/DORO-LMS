from rest_framework import serializers
from .models import SystemNotice

class SystemNoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = SystemNotice
        fields = ['id', 'title', 'content', 'created_at', 'author_name']