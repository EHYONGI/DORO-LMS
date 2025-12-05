from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Consultation
from .serializers import ConsultationSerializer, InstructorSerializer
from user.models import User
from lecture.models import Enrollment # Enrollment 모델 import 필요
from django.shortcuts import get_object_or_404

# 1. 상담 목록 조회(GET) 및 신청(POST) (기존 유지)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def consultation_list_create_api(request):
    """상담 목록 조회(GET - 필터링 포함) 및 신청(POST)"""
    
    if request.method == 'GET':
        # 1. 기본 쿼리셋: 내가 신청한 상담 전체 (최신순)
        queryset = Consultation.objects.filter(student=request.user).order_by('-id')

        # 2. 필터링 적용 (쿼리 파라미터가 있을 경우)
        status_param = request.query_params.get('status')
        type_param = request.query_params.get('type')
        method_param = request.query_params.get('method')
        instructor_param = request.query_params.get('instructor')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if type_param:
            queryset = queryset.filter(consultation_type=type_param)
        if method_param:
            queryset = queryset.filter(method=method_param)
        if instructor_param:
            queryset = queryset.filter(instructor_id=instructor_param)

        # 3. 결과 반환
        serializer = ConsultationSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ConsultationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        consultation = serializer.save(student=request.user)

        return Response(ConsultationSerializer(consultation).data,
                    status=status.HTTP_201_CREATED)




# 2. 강사 목록 조회 (수정됨: 내 강의 강사만)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_list_api(request):
    """내 수강 강의의 담당 강사 목록 조회"""
    user = request.user
    instructor_ids = Enrollment.objects.filter(student=user).values_list('lecture__instructor', flat=True).distinct()
    instructors = User.objects.filter(id__in=instructor_ids)
    
    serializer = InstructorSerializer(instructors, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def consultation_detail_api(request, pk):
    """상담 상세 조회, 수정, 삭제"""
    consultation = get_object_or_404(Consultation, pk=pk)
    if consultation.student != request.user and consultation.instructor != request.user:
        return Response({"error": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ConsultationSerializer(consultation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        consultation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ========== 강사용 API ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_consultation_list_api(request):
    """강사용: 내게 신청된 상담 목록 조회 (필터링 포함)"""
    
    queryset = Consultation.objects.filter(instructor=request.user).order_by('-created_at')

    status_param = request.query_params.get('status')
    type_param = request.query_params.get('type')
    method_param = request.query_params.get('method')
    student_param = request.query_params.get('student')

    if status_param:
        queryset = queryset.filter(status=status_param)
    if type_param:
        queryset = queryset.filter(consultation_type=type_param)
    if method_param:
        queryset = queryset.filter(method=method_param)
    if student_param:
        queryset = queryset.filter(student__username__icontains=student_param)

    serializer = ConsultationSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_consultation_status_api(request, pk):
    consultation = get_object_or_404(Consultation, pk=pk)

    if consultation.instructor != request.user:
        return Response({"error": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    new_status = request.data.get('status')

    if new_status not in ['APPROVED', 'CANCELED', 'COMPLETED']:
        return Response({"error": "유효하지 않은 상태입니다."}, status=status.HTTP_400_BAD_REQUEST)

    scheduled_at = request.data.get('scheduled_at')
    if scheduled_at:
        consultation.scheduled_at = scheduled_at

    consultation.status = new_status
    consultation.save()

    return Response(ConsultationSerializer(consultation).data)
