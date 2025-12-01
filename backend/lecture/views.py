# backend/lecture/views.py

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Enrollment, Assignment, Lecture
from .serializers import EnrollmentSerializer, AssignmentSerializer
from .models import LectureNotice
from .serializers import LectureNoticeSerializer
from .models import Attendance
from .serializers import AttendanceSerializer

# 1. 내 수강 강의 목록 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_course_list_api(request):
    """
    로그인한 학생이 수강 신청한 강의 목록 조회
    """
    user = request.user
    enrollments = Enrollment.objects.filter(student=user).select_related('lecture', 'lecture__instructor')
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)

# 2. 강의별 과제 현황 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_task_list_api(request):
    """
    내가 수강 중인 강의들의 과제 목록 조회
    """
    user = request.user
    # 내가 수강 중인 강의(Enrollment)들의 ID 리스트 추출
    enrolled_lecture_ids = Enrollment.objects.filter(student=user).values_list('lecture_id', flat=True)
    
    # 해당 강의들의 과제만 가져오기 (마감일 순 정렬)
    tasks = Assignment.objects.filter(lecture_id__in=enrolled_lecture_ids).order_by('deadline')
    
    serializer = AssignmentSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_notice_list_api(request, lecture_id):
    """특정 강의의 공지사항 목록 조회"""
    # 해당 강의의 공지들만 가져옴 (최신순 정렬)
    notices = LectureNotice.objects.filter(lecture_id=lecture_id).order_by('-created_at')
    serializer = LectureNoticeSerializer(notices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance_api(request, lecture_id):
    """특정 강의의 내 출결 현황 조회"""
    user = request.user
    attendances = Attendance.objects.filter(lecture_id=lecture_id, user=user).order_by('week')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecture_notice_detail_api(request, pk):
    """특정 강의 공지사항 상세 조회"""
    notice = get_object_or_404(LectureNotice, pk=pk)
    serializer = LectureNoticeSerializer(notice)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def course_assignment_list_api(request, lecture_id):
    """
    GET  : 특정 강의 과제 목록 조회
    POST : 특정 강의에 새 과제 생성 (강사만)
    """
    lecture = get_object_or_404(Lecture, pk=lecture_id)

    if request.method == 'GET':
        tasks = Assignment.objects.filter(lecture=lecture).order_by('deadline')
        serializer = AssignmentSerializer(tasks, many=True)
        return Response(serializer.data)

    # POST – 강사만 생성 가능
    if request.user != lecture.instructor:
        return Response(
            {"detail": "이 강의의 강사만 과제를 생성할 수 있습니다."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = AssignmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(lecture=lecture)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# [삭제됨] my_activity_api는 여기 있으면 안 됩니다.