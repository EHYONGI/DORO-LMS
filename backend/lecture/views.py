# backend/lecture/views.py

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Enrollment, Assignment, LectureNotice, Attendance, Lecture, LectureRecommendation, Wishlist
from .serializers import (
    EnrollmentSerializer, 
    AssignmentSerializer,
    LectureNoticeSerializer,
    AttendanceSerializer,
    LectureSerializer,
    # 추천 시스템 추가
    LectureRecommendationSerializer,
    LectureRecommendationResponseSerializer,
    EnrollmentCreateSerializer,
    UserCompetencySerializer,
    LectureDetailSerializer
)
from .services import LectureRecommendationService
from .models import Wishlist, Lecture


# ==================== 기존 API ====================

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_assignment_list_api(request, lecture_id):
    """특정 강의의 과제 목록 조회"""
    # URL에서 넘겨받은 lecture_id로 필터링
    tasks = Assignment.objects.filter(lecture_id=lecture_id).order_by('deadline')
    serializer = AssignmentSerializer(tasks, many=True)
    return Response(serializer.data)



# ==================== 추천 시스템 API (신규) ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_lectures(request):
    """
    전체 강의 목록 조회 (수강신청 페이지용)
    - OPEN, RECRUITING 상태 강의만 반환
    """
    lectures = Lecture.objects.filter(
        status__in=['OPEN', 'RECRUITING']
    ).select_related('instructor')
    
    serializer = LectureSerializer(lectures, many=True)
    return Response(serializer.data)


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



## ==========관심 강의 추가===========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list_api(request):
    """
    내 관심 강의 목록 조회
    GET /api/courses/wishlist
    """
    user = request.user
    wishlist_items = Wishlist.objects.filter(user=user).select_related('lecture', 'lecture__instructor')
    lectures = [item.lecture for item in wishlist_items]
    serializer = LectureSerializer(lectures, many=True)
    return Response(serializer.data)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_add_remove_api(request, lecture_id):
    """
    관심 강의 추가 / 삭제
    POST /api/courses/<lecture_id>/wishlist
    DELETE /api/courses/<lecture_id>/wishlist
    """
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


##=========================수강 취소==============
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_enrollment_api(request, enrollment_id):
    """
    수강 취소
    DELETE /api/lectures/enrollments/<enrollment_id>/
    """
    user = request.user
    
    try:
        enrollment = Enrollment.objects.get(id=enrollment_id, student=user)
    except Enrollment.DoesNotExist:
        return Response(
            {'error': '수강 신청 내역을 찾을 수 없습니다.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 강의 진행 중이면 취소 불가 (옵션)
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
