# backend/notice/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import SystemNotice
from .serializers import SystemNoticeSerializer
from lecture.models import LectureNotice, Enrollment
from lecture.serializers import LectureNoticeSerializer


# 1. 대시보드 공지 목록 (시스템 + 강의 공지 통합)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_notice_list_api(request):
    """
    대시보드용 공지 목록 API

    - 시스템 공지(SystemNotice)
    - 내가 수강 중인 강의의 강의 공지(LectureNotice)
    를 한 번에 모아서 반환
    """
    user = request.user

    # 1) 시스템 공지 (전체 공지)
    sys_notices = SystemNotice.objects.all().order_by('-created_at')
    sys_data = SystemNoticeSerializer(sys_notices, many=True).data
    for item in sys_data:
        item['type'] = 'system'  # 시스템 공지라는 타입 태그

    # 2) 내가 수강 중인 강의들
    enrolled_lecture_ids = Enrollment.objects.filter(
        student=user
    ).values_list('lecture_id', flat=True)

    # 3) 그 강의들에 대한 강의 공지
    lec_notices = LectureNotice.objects.filter(
        lecture_id__in=enrolled_lecture_ids
    ).order_by('-created_at')
    lec_data = LectureNoticeSerializer(lec_notices, many=True).data
    for item in lec_data:
        item['type'] = 'lecture'  # 강의 공지 타입 태그

    # 4) 두 리스트 합치고 created_at 기준 내림차순 정렬
    all_notices = sys_data + lec_data
    all_notices.sort(key=lambda x: x['created_at'], reverse=True)

    return Response(all_notices, status=status.HTTP_200_OK)


# 2. 공지 상세 조회 (현재는 시스템 공지만)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notice_detail_api(request, pk):
    """
    공지 상세 조회
    - 지금은 일단 SystemNotice(시스템 공지)만 상세 조회
    - 필요하면 LectureNotice 상세 조회도 분리해서 추가 가능
    """
    notice = get_object_or_404(SystemNotice, pk=pk)
    serializer = SystemNoticeSerializer(notice)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 3. 시스템 공지 생성 (관리자/운영자용)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def system_notice_create_api(request):
    """
    시스템 공지 생성 API

    - 작성자(author)는 항상 현재 로그인한 사용자
    - 제목, 내용은 body에서 받음
    """
    serializer = SystemNoticeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 4. 시스템 공지 수정 / 삭제
@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def system_notice_update_delete_api(request, pk):
    """
    시스템 공지 수정 / 삭제 API
    """
    notice = get_object_or_404(SystemNotice, pk=pk)

    # [수정] 권한 체크: 작성자 본인 OR 스태프 OR 매니저(role==0)
    is_manager = getattr(request.user, 'role', None) == 0
    if request.user != notice.author and not request.user.is_staff and not is_manager:
        return Response(
            {"detail": "이 공지를 수정/삭제할 권한이 없습니다."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # 수정
    if request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = SystemNoticeSerializer(
            notice,
            data=request.data,
            partial=partial,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 삭제
    if request.method == 'DELETE':
        notice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def system_notice_list_api(request):
    notices = SystemNotice.objects.all().order_by('-created_at')
    serializer = SystemNoticeSerializer(notices, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)