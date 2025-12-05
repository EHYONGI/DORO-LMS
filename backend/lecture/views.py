# backend/lecture/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import date

# 같은 앱(lecture)의 모델들
from .models import (
    Lecture, Assignment, Attendance, Enrollment, LectureNotice, 
    Wishlist, LectureRecommendation, LectureApplication, Submission
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
    LectureDetailSerializer,
    SubmissionSerializer
)

# 추천 시스템 서비스
from .services import LectureRecommendationService


# ========================================
# 학생용 API - 내 강의 관련
# ========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_course_list_api(request):
    """로그인한 학생이 수강 신청한 강의 목록 조회"""
    user = request.user
    enrollments = Enrollment.objects.filter(student=user).select_related('lecture', 'lecture__instructor')
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


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
    serializer = AssignmentSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_notice_list_api(request, lecture_id):
    """특정 강의의 공지사항 목록 조회"""
    notices = LectureNotice.objects.filter(lecture_id=lecture_id).order_by('-created_at')
    serializer = LectureNoticeSerializer(notices, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance_api(request, lecture_id):
    """
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lecture_notice_detail_api(request, pk):
    """특정 강의 공지사항 상세 조회"""
    notice = get_object_or_404(LectureNotice, pk=pk)
    serializer = LectureNoticeSerializer(notice)
    return Response(serializer.data)


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_lecture_recommendations(request):
    """
    추천 결과 DB 저장 (배치 작업용)
    - 계산된 추천 결과를 DB에 저장
    - 주기적으로 실행하여 추천 결과 캐싱
    """
    user = request.user
    
    if user.role != 1:
        return Response(
            {'error': '학생만 추천을 받을 수 있습니다.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # 추천 저장
    LectureRecommendationService.save_recommendations(user)
    
    # 저장된 추천 조회
    saved = LectureRecommendation.objects.filter(user=user)[:10]
    serializer = LectureRecommendationSerializer(
        saved, 
        many=True, 
        context={'request': request}
    )
    
    return Response({
        'message': '추천이 저장되었습니다.',
        'count': saved.count(),
        'recommendations': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_recommendations(request):
    """
    저장된 추천 목록 조회
    - DB에 저장된 추천 결과 반환 (빠른 조회)
    """
    user = request.user
    
    if user.role != 1:
        return Response(
            {'error': '학생만 추천을 받을 수 있습니다.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    saved = LectureRecommendation.objects.filter(user=user)
    serializer = LectureRecommendationSerializer(
        saved, 
        many=True,
        context={'request': request}
    )
    
    return Response({
        'count': saved.count(),
        'recommendations': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_lecture_with_check(request):
    """
    역량 점수 확인 후 수강 신청
    - 역량 점수가 기준에 미달하면 신청 불가
    - 선수과목 미이수 시 신청 불가
    - 중복 수강 방지
    
    Request Body:
    {
        "lecture_id": 1
    }
    """
    serializer = EnrollmentCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        enrollment = serializer.save()
        return Response({
            'message': '수강 신청이 완료되었습니다.',
            'enrollment_id': enrollment.id,
            'lecture_name': enrollment.lecture.name
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lecture_detail_with_recommendation(request, lecture_id):
    """
    강의 상세 정보 + 추천 정보
    - 강의 기본 정보
    - 현재 사용자에 대한 추천 점수
    - 수강 자격 여부
    - 선수과목 목록
    """
    try:
        lecture = Lecture.objects.get(id=lecture_id)
    except Lecture.DoesNotExist:
        return Response(
            {'error': '강의를 찾을 수 없습니다.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = LectureDetailSerializer(lecture, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_enrollment_eligibility(request, lecture_id):
    """
    수강 신청 가능 여부 확인
    - 역량 점수 확인
    - 선수과목 확인
    - 중복 수강 확인
    
    Response:
    {
        "eligible": true/false,
        "reason": "불가 사유",
        "required_score": 60,
        "user_score": 75,
        "missing_prerequisites": []
    }
    """
    user = request.user
    
    try:
        lecture = Lecture.objects.get(id=lecture_id)
    except Lecture.DoesNotExist:
        return Response(
            {'error': '강의를 찾을 수 없습니다.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 이미 수강 중인지 확인
    if Enrollment.objects.filter(student=user, lecture=lecture).exists():
        return Response({
            'eligible': False,
            'reason': '이미 수강 중인 강의입니다.'
        })
    
    # 역량 점수 확인
    if lecture.competency_type:
        user_score = user.get_competency_scores()[lecture.competency_type]
        required_score = lecture.required_score
        
        if user_score < required_score:
            return Response({
                'eligible': False,
                'reason': f'{lecture.get_competency_type_display()} 역량 점수가 부족합니다.',
                'required_score': required_score,
                'user_score': user_score,
                'competency_type': lecture.get_competency_type_display()
            })
    
    # 선수과목 확인
    prerequisites = lecture.prerequisite_lectures.all()
    if prerequisites:
        completed_ids = Enrollment.objects.filter(
            student=user,
            lecture__in=prerequisites
        ).values_list('lecture_id', flat=True)
        
        missing = prerequisites.exclude(id__in=completed_ids)
        
        if missing.exists():
            return Response({
                'eligible': False,
                'reason': '선수과목을 먼저 이수해야 합니다.',
                'missing_prerequisites': [
                    {
                        'id': lec.id,
                        'name': lec.name,
                        'course_code': lec.course_code
                    }
                    for lec in missing
                ]
            })
    
    # 모든 조건 통과
    return Response({
        'eligible': True,
        'reason': '수강 신청이 가능합니다.'
    })


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
    특정 강의의 수강생 목록 조회 (강사 제외, 이름순 정렬)
    """
    try:
        lecture = Lecture.objects.get(id=lecture_id)
    except Lecture.DoesNotExist:
        return Response({'error': '강의를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
    
    if lecture.instructor != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    enrollments = Enrollment.objects.filter(lecture=lecture).select_related('student')
    
    students = []
    for enrollment in enrollments:
        student = enrollment.student
        if student == lecture.instructor:
            continue
        
        full_name = f"{student.last_name}{student.first_name}".strip() or student.username
        
        students.append({
            'id': student.id,
            'name': full_name,
            'username': student.username,
            'student_id': student.username, 
        })
    
    # [수정] 이름순 정렬
    students.sort(key=lambda x: x['name'])
    
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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manager_create_lecture_api(request):
    """[매니저] 강의 개설"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    data['status'] = 'RECRUITING'
    
    serializer = LectureSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_lecture_list_api(request):
    """[매니저] 전체 강의 목록 조회"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    lectures = Lecture.objects.all().order_by('-created_at')
    serializer = LectureSerializer(lectures, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_lecture_applications_api(request, lecture_id):
    """[매니저] 특정 강의의 강사 지원자 목록 조회"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    applications = LectureApplication.objects.filter(lecture_id=lecture_id).select_related('instructor').order_by('-created_at')
    
    result = []
    for app in applications:
        result.append({
            'id': app.id,
            'instructor_name': app.instructor.username,
            'instructor_full_name': f"{app.instructor.last_name}{app.instructor.first_name}",
            'message': app.message,
            'status': app.status,
            'created_at': app.created_at
        })
    return Response(result)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manager_application_process_api(request, application_id):
    """[매니저] 강사 지원 승인/반려 처리"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    application = get_object_or_404(LectureApplication, id=application_id)
    action = request.data.get('action')
    lecture = application.lecture
    
    if action == 'APPROVE':
        # 이미 강사가 있는 경우 체크 (선택 사항)
        if lecture.instructor:
            return Response({'error': '이미 강사가 배정된 강의입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 강사 배정 및 상태 변경
        lecture.instructor = application.instructor
        lecture.status = 'OPEN' 
        lecture.save()
        
        # 지원서 승인 처리
        application.status = 'APPROVED'
        application.save()
        
        # (옵션) 다른 대기중인 지원서는 자동으로 반려할 수도 있음
        
        return Response({'message': '강사가 배정되었습니다.'})
        
    elif action == 'REJECT':
        application.status = 'REJECTED'
        application.save()
        return Response({'message': '지원이 반려되었습니다.'})
        
    return Response({'error': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)


# --- [추가된 기능] 강의 삭제 & 배정 취소 ---

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def manager_lecture_delete_api(request, lecture_id):
    """[매니저] 강의 삭제"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    lecture = get_object_or_404(Lecture, id=lecture_id)
    lecture.delete()
    
    return Response({'message': '강의가 삭제되었습니다.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manager_lecture_cancel_instructor_api(request, lecture_id):
    """[매니저] 강사 배정 취소 (반려 처리)"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    lecture = get_object_or_404(Lecture, id=lecture_id)
    
    if not lecture.instructor:
        return Response({'error': '배정된 강사가 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 1. 현재 배정된 강사의 승인된 지원서(Application) 찾기
    approved_app = LectureApplication.objects.filter(
        lecture=lecture, 
        instructor=lecture.instructor, 
        status='APPROVED'
    ).first()
    
    # 2. 지원서 상태를 'REJECTED'(반려) 또는 'PENDING'(대기)로 변경
    # 여기서는 '반려' 의미로 REJECTED 처리
    if approved_app:
        approved_app.status = 'REJECTED'
        approved_app.save()
    
    # 3. 강의 상태 초기화 (강사 제거, 모집중으로 변경)
    lecture.instructor = None
    lecture.status = 'RECRUITING'
    lecture.save()
    
    return Response({'message': '강사 배정이 취소되었습니다.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manager_lecture_close_enrollment_api(request, lecture_id):
    """[매니저] 강의 수강신청 마감 (상태를 IN_PROGRESS로 변경)"""
    if request.user.role != 0:
        return Response({'error': '관리자 권한이 필요합니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    lecture = get_object_or_404(Lecture, id=lecture_id)
    
    # 강사 배정 여부 확인
    if not lecture.instructor:
        return Response({'error': '배정된 강사가 없는 강의는 마감할 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 이미 마감되었거나 종료된 경우 확인 (선택 사항)
    if lecture.status not in ['OPEN']:
        return Response({'error': '수강신청 진행 중인 강의만 마감할 수 있습니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 상태 변경: OPEN -> IN_PROGRESS
    lecture.status = 'IN_PROGRESS'
    lecture.save()
    
    return Response({'message': '수강신청이 마감되었습니다. 수업이 시작됩니다.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_assignment_submissions_api(request, assignment_id):
    """
    [강사] 특정 과제에 대한 학생들의 제출 현황 조회
    """
    assignment = get_object_or_404(Assignment, id=assignment_id)
    
    # 권한 체크: 해당 과제의 강의 담당자인지 확인
    if assignment.lecture.instructor != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    
    # 해당 과제의 모든 제출물 조회 (최신순)
    submissions = Submission.objects.filter(assignment=assignment).select_related('student').order_by('-submitted_at')
    
    serializer = SubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_submission_api(request, assignment_id):
    """
    특정 과제에 대한 내 제출 내역 조회
    """
    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return Response({'error': '과제를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        # 내 제출 내역이 있는지 확인
        submission = Submission.objects.get(assignment=assignment, student=request.user)
        serializer = SubmissionSerializer(submission)
        return Response(serializer.data)
    except Submission.DoesNotExist:
        # 제출 내역이 없으면 204 No Content 반환 (프론트엔드 처리용)
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment_api(request, assignment_id):
    """
    과제 제출 및 수정
    - 이미 제출한 경우 내용을 덮어씁니다 (재제출)
    """
    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return Response({'error': '과제를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    content = request.data.get('content')
    file_obj = request.FILES.get('file')

    if not content:
        return Response({'error': '내용을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    # get_or_create를 사용하여 생성 또는 조회
    submission, created = Submission.objects.get_or_create(
        assignment=assignment,
        student=request.user,
        defaults={
            'content': content,
            'file': file_obj  # 파일 저장
        }
    )

    # 이미 존재한다면(재제출) 내용 업데이트
    if not created:
        submission.content = content
        if file_obj:
            submission.file = file_obj
        submission.submitted_at = timezone.now()
        submission.save()

    serializer = SubmissionSerializer(submission)
    return Response({
        'message': '과제가 성공적으로 제출되었습니다.',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_submission_api(request, submission_id):
    """
    [강사] 학생 제출물 채점 (점수 및 피드백 등록)
    """
    submission = get_object_or_404(Submission, id=submission_id)
    
    # 권한 체크: 해당 강의의 담당 강사인지 확인
    if submission.assignment.lecture.instructor != request.user:
        return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)

    grade = request.data.get('grade')
    feedback = request.data.get('feedback')

    # 점수와 피드백 업데이트
    if grade is not None:
        submission.grade = grade
    if feedback is not None:
        submission.feedback = feedback
    
    # 채점 일시 기록
    submission.graded_at = timezone.now()
    submission.save()

    return Response({
        'message': '채점이 완료되었습니다.',
        'data': SubmissionSerializer(submission).data
    }, status=status.HTTP_200_OK)