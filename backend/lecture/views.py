# backend/lecture/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import date

<<<<<<< HEAD
# 같은 앱(lecture)의 모델들
from .models import (
    Lecture, Assignment, Attendance, Enrollment, LectureNotice, 
    Wishlist, LectureRecommendation, LectureApplication
)

# user 앱의 모델
from user.models import User

# 같은 앱(lecture)의 시리얼라이저들
from .serializers import (
    LectureSerializer, 
    AssignmentSerializer,
    AttendanceSerializer,
    EnrollmentSerializer,
    StudentSerializer, 
    LectureNoticeSerializer,
    # 추천 시스템 시리얼라이저
    LectureRecommendationSerializer,
    LectureRecommendationResponseSerializer,
    EnrollmentCreateSerializer,
    UserCompetencySerializer,
    LectureDetailSerializer
)

# 추천 시스템 서비스
from .services import LectureRecommendationService


# ========================================
# 학생용 API - 내 강의 관련
# ========================================

=======
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
>>>>>>> parent of 777f554 (student 완성)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_course_list_api(request):
    """로그인한 학생이 수강 신청한 강의 목록 조회"""
    user = request.user
    enrollments = Enrollment.objects.filter(
        student=user
    ).select_related('lecture', 'lecture__instructor')
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


<<<<<<< HEAD
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_task_list_api(request):
    """내가 수강 중인 강의들의 과제 목록 조회"""
    user = request.user
    enrolled_lecture_ids = Enrollment.objects.filter(student=user).values_list('lecture_id', flat=True)
    tasks = Assignment.objects.filter(lecture_id__in=enrolled_lecture_ids).order_by('due_date')
    serializer = AssignmentSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_assignment_list_api(request, lecture_id):
    """특정 강의의 과제 목록 조회"""
    tasks = Assignment.objects.filter(lecture_id=lecture_id).order_by('due_date')
=======
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

>>>>>>> parent of 777f554 (student 완성)
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
<<<<<<< HEAD
    """특정 강의의 공지사항 목록 조회"""
    notices = LectureNotice.objects.filter(lecture_id=lecture_id).order_by('-created_at')
=======
    """
    특정 강의의 공지사항 목록 조회
    """
    notices = LectureNotice.objects.filter(
        lecture_id=lecture_id
    ).order_by('-created_at')
>>>>>>> parent of 777f554 (student 완성)
    serializer = LectureNoticeSerializer(notices, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# 5. 특정 강의의 내 출결 현황 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance_api(request, lecture_id):
    """
<<<<<<< HEAD
    학생 본인의 특정 강의 출결 기록 조회
    """
    try:
        lecture = Lecture.objects.get(id=lecture_id)
    except Lecture.DoesNotExist:
        return Response({'error': '강의를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
    
    # 해당 강의를 수강하는지 확인
    if not Enrollment.objects.filter(lecture=lecture, student=request.user).exists():
        return Response({'error': '이 강의를 수강하지 않습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    # 본인의 출결 기록 조회
    attendances = Attendance.objects.filter(
        lecture=lecture,
        student=request.user
    ).order_by('week')
    
    result = []
    for att in attendances:
        # IntegerChoices 값을 문자열로 변환
        if att.status == Attendance.Status.PRESENT:
            status_str = 'PRESENT'
        elif att.status == Attendance.Status.LATE:
            status_str = 'LATE'
        else:
            status_str = 'ABSENT'
        
        result.append({
            'id': att.id,
            'week': att.week,
            'attendance_date': att.attendance_date,
            'status': status_str,
        })
    
    return Response(result)
=======
    특정 강의에서 '나'의 출결 현황 조회
    """
    user = request.user
    attendances = Attendance.objects.filter(
        lecture_id=lecture_id,
        user=user,
    ).order_by('week')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
>>>>>>> parent of 777f554 (student 완성)


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


<<<<<<< HEAD
# ========================================
# 수강 신청 관련
# ========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_lectures(request):
    """전체 강의 목록 조회 (수강신청 페이지용)"""
    lectures = Lecture.objects.filter(
        status__in=['OPEN', 'RECRUITING']
    ).select_related('instructor')
    serializer = LectureSerializer(lectures, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_enrollment_api(request, enrollment_id):
    """수강 취소"""
    user = request.user
    
    try:
        enrollment = Enrollment.objects.get(id=enrollment_id, student=user)
    except Enrollment.DoesNotExist:
        return Response(
            {'error': '수강 신청 내역을 찾을 수 없습니다.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 강의 진행 중이면 취소 불가
    if enrollment.lecture.status == 'IN_PROGRESS':
        return Response(
            {'error': '이미 진행 중인 강의는 취소할 수 없습니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    lecture_name = enrollment.lecture.name
    enrollment.delete()
    
    return Response({
        'message': f'{lecture_name} 수강 신청이 취소되었습니다.'
    }, status=status.HTTP_200_OK)


# ========================================
# 관심 강의 (Wishlist)
# ========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list_api(request):
    """내 관심 강의 목록 조회"""
    user = request.user
    wishlist_items = Wishlist.objects.filter(user=user).select_related('lecture', 'lecture__instructor')
    lectures = [item.lecture for item in wishlist_items]
    serializer = LectureSerializer(lectures, many=True)
    return Response(serializer.data)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_add_remove_api(request, lecture_id):
    """관심 강의 추가 / 삭제"""
    user = request.user
    lecture = get_object_or_404(Lecture, id=lecture_id)

    if request.method == 'POST':
        obj, created = Wishlist.objects.get_or_create(user=user, lecture=lecture)
        if created:
            return Response({'message': '관심 강의에 추가되었습니다.'}, status=status.HTTP_201_CREATED)
        return Response({'message': '이미 관심 강의에 있습니다.'}, status=status.HTTP_200_OK)

    # DELETE
    Wishlist.objects.filter(user=user, lecture=lecture).delete()
    return Response({'message': '관심 강의에서 삭제되었습니다.'}, status=status.HTTP_200_OK)


# ========================================
# 추천 시스템 API
# ========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lecture_recommendations(request):
    """
    실시간 강의 추천 API
    - 사용자의 역량 점수를 기반으로 적합한 강의 추천
    - 이미 수강 중인 강의 제외
    - 선수과목 요구사항 확인
    """
    user = request.user
    
    # 학생만 추천 가능
    if user.role != 1:
        return Response(
            {'error': '학생만 추천을 받을 수 있습니다.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # 실시간 추천 계산
    recommendations = LectureRecommendationService.get_recommendations(user, limit=10)
    
    # 응답 데이터 생성
    response_data = []
    for rec in recommendations:
        lecture = rec['lecture']
        
        # 수강 여부 및 위시리스트 확인
        is_enrolled = Enrollment.objects.filter(student=user, lecture=lecture).exists()
        is_in_wishlist = Wishlist.objects.filter(user=user, lecture=lecture).exists()
        
        response_data.append({
            'lecture_id': lecture.id,
            'lecture_name': lecture.name,
            'course_code': lecture.course_code,
            'competency_type': lecture.competency_type,
            'competency_type_display': lecture.get_competency_type_display() if lecture.competency_type else None,
            'level': lecture.level,
            'level_display': lecture.get_level_display(),
            'required_score': lecture.required_score,
            'instructor_name': lecture.instructor.username if lecture.instructor else None,
            'match_score': rec['score'],
            'reason': rec['reason'],
            'is_enrolled': is_enrolled,
            'is_in_wishlist': is_in_wishlist,
        })
    
    serializer = LectureRecommendationResponseSerializer(response_data, many=True)
    
    return Response({
        'count': len(response_data),
        'user_competency': UserCompetencySerializer(user).data,
        'recommendations': serializer.data
    })
=======
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
>>>>>>> parent of 777f554 (student 완성)


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

<<<<<<< HEAD

# ========================================
# 강사용 API - 내 강의 관리
# ========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_my_courses_api(request):
    """강사가 담당하는 강의 목록 조회"""
    lectures = Lecture.objects.filter(instructor=request.user).order_by('-created_at')
    serializer = LectureSerializer(lectures, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lecture_assignments_api(request, lecture_id):
    """특정 강의의 과제 목록 조회 및 등록"""
    lecture = get_object_or_404(Lecture, id=lecture_id)
    
    # 강사 권한 확인
    if lecture.instructor != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        assignments = Assignment.objects.filter(lecture=lecture).order_by('-created_at')
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # 과제 등록
        title = request.data.get('title')
        description = request.data.get('description')
        due_date = request.data.get('due_date')
        
        if not title or not description or not due_date:
            return Response(
                {'error': '제목, 설명, 마감일을 모두 입력해주세요.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment = Assignment.objects.create(
            lecture=lecture,
            title=title,
            description=description,
            due_date=due_date
        )
        
        return Response({
            'id': assignment.id,
            'title': assignment.title,
            'description': assignment.description,
            'due_date': assignment.due_date,
            'lecture': assignment.lecture_id,
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecture_students_api(request, lecture_id):
    """
    특정 강의의 수강생 목록 조회 (강사 제외)
    """
    try:
        lecture = Lecture.objects.get(id=lecture_id)
    except Lecture.DoesNotExist:
        return Response({'error': '강의를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
    
    # 강사 권한 확인
    if lecture.instructor != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    # 해당 강의를 수강하는 학생들 조회 (강사 제외)
    enrollments = Enrollment.objects.filter(lecture=lecture).select_related('student')
    
    students = []
    for enrollment in enrollments:
        student = enrollment.student
        
        # ✅ 강사는 제외 (강사 본인이 enrollment에 있어도 제외)
        if student == lecture.instructor:
            continue
        
        # ✅ User role이 있다면 student인 경우만 포함 (선택사항)
        # if hasattr(student, 'role') and student.role != 'student':
        #     continue
        
        # 학생 이름 처리
        full_name = f"{student.last_name}{student.first_name}".strip()
        if not full_name:
            full_name = student.username
        
        students.append({
            'id': student.id,
            'name': full_name,
            'username': student.username,
            'student_id': student.username,  # 학번
        })
    
    return Response(students)

# ========================================
# 강사용 API - 출결 관리
# ========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lecture_attendance_week_api(request, lecture_id, week):
    """
    특정 강의의 특정 주차 출결 조회 및 저장
    
    GET: 특정 주차의 출결 데이터 조회
    POST: 출결 데이터 저장/수정
    """
    try:
        lecture = Lecture.objects.get(id=lecture_id)
    except Lecture.DoesNotExist:
        return Response({'error': '강의를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
    
    # 강사 권한 확인
    if lecture.instructor != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # 특정 주차의 출결 데이터 조회
        attendances = Attendance.objects.filter(
            lecture=lecture,
            week=week
        ).select_related('student')
        
        result = []
        for att in attendances:
            # IntegerChoices 값을 문자열로 변환
            if att.status == Attendance.Status.PRESENT:
                status_str = 'PRESENT'
            elif att.status == Attendance.Status.LATE:
                status_str = 'LATE'
            else:
                status_str = 'ABSENT'
            
            # ✅ 학생 이름 처리 수정
            full_name = f"{att.student.last_name}{att.student.first_name}".strip()
            if not full_name:
                full_name = att.student.username
            
            result.append({
                'id': att.id,
                'student_id': att.student.id,
                'student_name': full_name,
                'week': att.week,
                'status': status_str,
                'attendance_date': att.attendance_date,
            })
        
        return Response(result)
    
    elif request.method == 'POST':
        # 출결 데이터 저장/수정
        attendances_data = request.data.get('attendances', [])
        
        if not attendances_data:
            return Response({'error': '출결 데이터가 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 기존 출결 데이터 삭제 (같은 주차)
        Attendance.objects.filter(lecture=lecture, week=week).delete()
        
        # 새로운 출결 데이터 생성
        created_count = 0
        for att_data in attendances_data:
            student_id = att_data.get('student_id')
            status_str = att_data.get('status', 'PRESENT')
            
            try:
                student = User.objects.get(id=student_id)
            except User.DoesNotExist:
                continue
            
            # 문자열 상태를 IntegerChoices 값으로 변환
            if status_str == 'PRESENT':
                status_value = Attendance.Status.PRESENT
            elif status_str == 'LATE':
                status_value = Attendance.Status.LATE
            else:
                status_value = Attendance.Status.ABSENT
            
            # 출결 생성
            Attendance.objects.create(
                lecture=lecture,
                student=student,
                week=week,
                status=status_value,
                attendance_date=timezone.now().date()
            )
            created_count += 1
        
        return Response({
            'message': f'{created_count}명의 출결이 저장되었습니다.',
            'count': created_count
        }, status=status.HTTP_201_CREATED)

# ========================================
# 강사용 API - 공지사항 관리
# ========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lecture_notices_api(request, lecture_id):
    """강의 공지사항 목록 조회 및 작성"""
    lecture = get_object_or_404(Lecture, id=lecture_id)
    
    if request.method == 'GET':
        notices = LectureNotice.objects.filter(lecture=lecture).order_by('-created_at')
        
        # 응답 데이터 직접 구성
        result = []
        for notice in notices:
            result.append({
                'id': notice.id,
                'title': notice.title,
                'body': notice.body,
                'created_at': notice.created_at,
                'author_name': lecture.instructor.username if lecture.instructor else '관리자',
                'lecture': notice.lecture_id
            })
        
        return Response(result)
    
    elif request.method == 'POST':
        # 강사 권한 확인
        if lecture.instructor != request.user:
            return Response(
                {'error': '권한이 없습니다.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        title = request.data.get('title')
        body = request.data.get('body')
        
        if not title or not body:
            return Response(
                {'error': '제목과 내용을 입력해주세요.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 공지 생성
        notice = LectureNotice.objects.create(
            lecture=lecture,
            title=title,
            body=body
        )
        
        return Response({
            'id': notice.id,
            'title': notice.title,
            'body': notice.body,
            'created_at': notice.created_at,
            'author_name': lecture.instructor.username if lecture.instructor else '관리자',
            'lecture': notice.lecture_id
        }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def lecture_notice_detail_api(request, notice_id):
    """강의 공지사항 상세 조회, 수정, 삭제"""
    notice = get_object_or_404(LectureNotice, id=notice_id)
    lecture = notice.lecture
    
    if request.method == 'GET':
        return Response({
            'id': notice.id,
            'title': notice.title,
            'body': notice.body,
            'created_at': notice.created_at,
            'author_name': lecture.instructor.username if lecture.instructor else '관리자',
            'lecture': notice.lecture_id
        })
    
    elif request.method == 'PUT':
        # 강사만 수정 가능
        if lecture.instructor != request.user:
            return Response(
                {'error': '권한이 없습니다.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        title = request.data.get('title')
        body = request.data.get('body')
        
        if title:
            notice.title = title
        if body:
            notice.body = body
        
        notice.save()
        
        return Response({
            'id': notice.id,
            'title': notice.title,
            'body': notice.body,
            'created_at': notice.created_at,
            'author_name': lecture.instructor.username if lecture.instructor else '관리자',
            'lecture': notice.lecture_id
        })
    
    elif request.method == 'DELETE':
        # 강사만 삭제 가능
        if lecture.instructor != request.user:
            return Response(
                {'error': '권한이 없습니다.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        notice.delete()
        return Response({'message': '삭제되었습니다.'}, status=status.HTTP_204_NO_CONTENT)


# ========================================
# 강사용 API - 강의 지원 관리
# ========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def teacher_applications_api(request):
    """
    강사의 강의 지원 목록 조회 및 지원
    
    GET: 내 지원 내역 조회
    POST: 새로운 강의 지원
    """
    user = request.user
    
    if request.method == 'GET':
        # 내 지원 내역 조회
        applications = LectureApplication.objects.filter(
            instructor=user
        ).select_related('lecture', 'lecture__instructor').order_by('-created_at')
        
        result = []
        for app in applications:
            result.append({
                'id': app.id,
                'lecture': {
                    'id': app.lecture.id,
                    'name': app.lecture.name,
                    'description': app.lecture.description,
                    'status': app.lecture.status,
                    'instructor_name': app.lecture.instructor.username if app.lecture.instructor else None,
                    'course_code': app.lecture.course_code,
                    'competency_type': app.lecture.competency_type,
                    'competency_type_display': app.lecture.get_competency_type_display() if app.lecture.competency_type else None,
                    'level': app.lecture.level,
                    'level_display': app.lecture.get_level_display(),
                },
                'message': app.message,
                'status': app.status,
                'created_at': app.created_at,
            })
        
        return Response(result)
    
    elif request.method == 'POST':
        # 새로운 강의 지원
        lecture_id = request.data.get('lecture_id')
        message = request.data.get('message', '')
        
        if not lecture_id:
            return Response(
                {'error': '강의 ID를 입력해주세요.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lecture = Lecture.objects.get(id=lecture_id)
        except Lecture.DoesNotExist:
            return Response(
                {'error': '존재하지 않는 강의입니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 이미 지원했는지 확인
        if LectureApplication.objects.filter(instructor=user, lecture=lecture).exists():
            return Response(
                {'error': '이미 지원한 강의입니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 이미 강사가 배정된 경우
        if lecture.instructor and lecture.status != 'RECRUITING':
            return Response(
                {'error': '이미 강사가 배정된 강의입니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 지원 생성
        application = LectureApplication.objects.create(
            instructor=user,
            lecture=lecture,
            message=message
        )
        
        return Response({
            'id': application.id,
            'lecture_id': lecture.id,
            'lecture_name': lecture.name,
            'message': message,
            'status': application.status,
            'created_at': application.created_at,
        }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def teacher_application_cancel_api(request, application_id):
    """강의 지원 취소"""
    user = request.user
    
    try:
        application = LectureApplication.objects.get(id=application_id, instructor=user)
    except LectureApplication.DoesNotExist:
        return Response(
            {'error': '지원 내역을 찾을 수 없습니다.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 이미 승인된 경우 취소 불가
    if application.status == 'APPROVED':
        return Response(
            {'error': '이미 승인된 지원은 취소할 수 없습니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    lecture_name = application.lecture.name
    application.delete()
    
    return Response({
        'message': f'{lecture_name} 지원이 취소되었습니다.'
    }, status=status.HTTP_200_OK)
=======
    # 여기서 request.data 내용을 로그로 남기거나, 별도 모델에 저장하도록 확장 가능
    return Response(
        {
            "detail": "제출 요청이 정상적으로 접수되었습니다. (더미 구현)",
            "lecture_id": lecture.id,
            "assignment_id": assignment.id,
        },
        status=status.HTTP_200_OK,
    )
>>>>>>> parent of 777f554 (student 완성)
