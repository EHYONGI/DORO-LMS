# backend/notice/views.py (기존 내용을 지우고 아래로 교체 권장)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import SystemNotice
from .serializers import SystemNoticeSerializer
from lecture.models import LectureNotice, Enrollment
from lecture.serializers import LectureNoticeSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_notice_list_api(request):
    """
    대시보드용 통합 공지 (시스템 공지 + 내 강의 공지)
    """
    user = request.user

    # 1. 전체 시스템 공지 가져오기
    sys_notices = SystemNotice.objects.all()
    sys_data = SystemNoticeSerializer(sys_notices, many=True).data
    # 구분 태그 추가
    for item in sys_data:
        item['category'] = '전체 공지'
        item['type'] = 'system'

    # 2. 내가 수강 중인 강의의 공지 가져오기
    enrolled_lecture_ids = Enrollment.objects.filter(student=user).values_list('lecture_id', flat=True)
    lec_notices = LectureNotice.objects.filter(lecture_id__in=enrolled_lecture_ids)
    lec_data = LectureNoticeSerializer(lec_notices, many=True).data
    # 구분 태그 추가
    for item in lec_data:
        item['category'] = item.get('lecture_name', '강의 공지') # 강의 이름 표시
        item['type'] = 'lecture'

    # 3. 두 리스트 합치고 날짜(created_at) 기준 내림차순 정렬
    all_notices = sys_data + lec_data
    all_notices.sort(key=lambda x: x['created_at'], reverse=True)

    return Response(all_notices)

@api_view(['GET'])
def notice_detail_api(request, pk):
    # (기존 상세 조회 로직 유지 - 필요하면 시스템/강의 공지 구분해서 가져오는 로직 추가 필요)
    # 일단 간단하게 시스템 공지 상세만 구현
    notice = get_object_or_404(SystemNotice, pk=pk)
    serializer = SystemNoticeSerializer(notice)
    return Response(serializer.data)