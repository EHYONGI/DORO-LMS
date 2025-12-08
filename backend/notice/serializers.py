from rest_framework import serializers
from .models import SystemNotice

class SystemNoticeSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = SystemNotice
        fields = ['id', 'title', 'content', 'created_at', 'author_name']

    def get_author_name(self, obj):
        if not obj.author:
            return "알 수 없음"
        full_name = f"{obj.author.last_name}{obj.author.first_name}".strip()
        return full_name if full_name else obj.author.username