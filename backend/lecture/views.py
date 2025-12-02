# backend/lecture/views.py

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Enrollment,
    Assignment,
    Lecture,
    LectureNotice,
    Attendance,
)
from .serializers import (
    EnrollmentSerializer,
    AssignmentSerializer,
    LectureSerializer,
    LectureNoticeSerializer,
    AttendanceSerializer,
)


# 1. 내 수강 강의 목록 조회 (대시보드에서 사용)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_course_list_api(request):
    """
    로그인한 학생이 수강 신청한 강의 목록 조회
    """
    user = request.user
    enrollments = Enrollment.objects.filter(
        student=user
    ).select_related('lecture', 'lecture__instructor')
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 2. 내 할 일(과제) 목록 조회 (대시보드에서 사용)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_task_list_api(request):
    """
    대시보드용 '내 할 일(과제)' 목록 조회 API

    - 로그인한 유저가 수강 중인 강의들(Enrollment 기준)을 찾고
    - 그 강의들에 연결된 Assignment 목록을 마감일(deadline) 순으로 반환
    """
    user = request.user

    # 내가 수강 중인 강의들의 ID 리스트
    enrolled_lecture_ids = Enrollment.objects.filter(
        student=user
    ).values_list('lecture_id', flat=True)

    # 해당 강의들의 과제만 가져오기 (마감일 오름차순)
    tasks = Assignment.objects.filter(
        lecture_id__in=enrolled_lecture_ids
    ).order_by('deadline')

    serializer = AssignmentSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 3. 특정 강의 상세 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecture_detail_api(request, lecture_id):
    """
    특정 강의 상세 정보 조회
    """
    lecture = get_object_or_404(Lecture, pk=lecture_id)
    serializer = LectureSerializer(lecture)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 4. 특정 강의의 공지사항 목록 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_notice_list_api(request, lecture_id):
    """
    특정 강의의 공지사항 목록 조회
    """
    notices = LectureNotice.objects.filter(
        lecture_id=lecture_id
    ).order_by('-created_at')
    serializer = LectureNoticeSerializer(notices, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 5. 특정 강의의 내 출결 현황 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance_api(request, lecture_id):
    """
    특정 강의에서 '나'의 출결 현황 조회
    """
    user = request.user
    attendances = Attendance.objects.filter(
        lecture_id=lecture_id,
        user=user,
    ).order_by('week')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 6. 특정 강의의 전체 학생 출결 조회 (강사용)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_all_students_api(request, lecture_id):
    """
    특정 강의의 모든 학생 출결 현황 조회 (강사용)

    간단하게: 해당 강의의 Attendance 레코드를 모두 반환.
    (학생 이름 등 추가 정보가 필요하면 나중에 커스텀 Serializer 작성 가능)
    """
    attendances = Attendance.objects.filter(
        lecture_id=lecture_id
    ).order_by('week', 'user_id')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 7. 출결 업데이트 (강사용) – 간단한 버전
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attendance_update_api(request, lecture_id):
    """
    특정 강의의 출결 상태를 일괄 업데이트 (강사용)

    기대 형식 (예시):
    {
      "updates": [
        {"id": 1, "status": 1},   # PRESENT
        {"id": 2, "status": 0},   # ABSENT
        {"id": 3, "status": 2}    # LATE
      ]
    }
    """
    user = request.user

    # 강의 가져오기 (강사 확인용, 필요하면 instructor 검사 추가 가능)
    lecture = get_object_or_404(Lecture, pk=lecture_id)

    # TODO: 필요하면 여기서 user가 lecture.instructor인지 체크
    # if lecture.instructor != user: ...

    updates = request.data.get('updates', [])
    if not isinstance(updates, list):
        return Response(
            {"detail": "updates 필드는 리스트여야 합니다."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for item in updates:
        att_id = item.get('id')
        status_value = item.get('status')
        if att_id is None or status_value is None:
            continue
        try:
            att = Attendance.objects.get(id=att_id, lecture=lecture)
            att.status = status_value
            att.save()
        except Attendance.DoesNotExist:
            continue

    return Response({"detail": "출결이 업데이트되었습니다."}, status=status.HTTP_200_OK)


# 8. 특정 강의 공지사항 상세 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecture_notice_detail_api(request, pk):
    """
    특정 강의 공지사항 상세 조회
    """
    notice = get_object_or_404(LectureNotice, pk=pk)
    serializer = LectureNoticeSerializer(notice)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 9. 특정 강의 과제 목록 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assignment_list_api(request, lecture_id):
    """
    특정 강의의 과제 목록 조회
    """
    lecture = get_object_or_404(Lecture, pk=lecture_id)
    tasks = Assignment.objects.filter(
        lecture=lecture
    ).order_by('deadline')
    serializer = AssignmentSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 10. 특정 강의에 과제 생성 (강사용)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assignment_create_api(request, lecture_id):
    """
    특정 강의에 새 과제 생성 (강사만)
    """
    lecture = get_object_or_404(Lecture, pk=lecture_id)

    # 강사 권한 체크 (필요 시)
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


# 11. 특정 과제 상세 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assignment_detail_api(request, lecture_id, assignment_id):
    """
    특정 강의 안의 특정 과제 상세 조회
    """
    lecture = get_object_or_404(Lecture, pk=lecture_id)
    assignment = get_object_or_404(Assignment, pk=assignment_id, lecture=lecture)
    serializer = AssignmentSerializer(assignment)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 12. 과제 제출 (학생) – 모델이 따로 없으므로 일단 더미 구현
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assignment_submit_api(request, lecture_id, assignment_id):
    """
    과제 제출 API (간단 더미 버전)

    실제 제출 파일/내용을 저장하는 모델이 없으므로,
    지금은 요청이 들어왔다는 것만 확인하는 용도로 응답.

    나중에 AssignmentSubmission 모델을 만들면 여기서 실제 저장 로직을 구현하면 된다.
    """
    # 일단 존재 여부만 체크
    lecture = get_object_or_404(Lecture, pk=lecture_id)
    assignment = get_object_or_404(Assignment, pk=assignment_id, lecture=lecture)

    # 여기서 request.data 내용을 로그로 남기거나, 별도 모델에 저장하도록 확장 가능
    return Response(
        {
            "detail": "제출 요청이 정상적으로 접수되었습니다. (더미 구현)",
            "lecture_id": lecture.id,
            "assignment_id": assignment.id,
        },
        status=status.HTTP_200_OK,
    )
