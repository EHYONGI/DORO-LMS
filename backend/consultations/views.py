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
        queryset = Consultation.objects.filter(student=request.user).order_by('-created_at')

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
        # ... (기존 POST 로직 그대로 유지) ...
        serializer = ConsultationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. 강사 목록 조회 (수정됨: 내 강의 강사만)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_list_api(request):
    """내 수강 강의의 담당 강사 목록 조회"""
    user = request.user
    
    # 1. 내가 수강 중인 강의들의 강사 ID 리스트 추출 (distinct로 중복 제거)
    instructor_ids = Enrollment.objects.filter(student=user).values_list('lecture__instructor', flat=True).distinct()
    
    # 2. 해당 ID를 가진 User(강사)들만 조회
    instructors = User.objects.filter(id__in=instructor_ids)
    
    serializer = InstructorSerializer(instructors, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def consultation_detail_api(request, pk):
    """상담 상세 조회, 수정, 삭제"""
    consultation = get_object_or_404(Consultation, pk=pk)

    # 권한 체크: 본인이 신청한 상담이거나 담당 강사만 접근 가능
    if consultation.student != request.user and consultation.instructor != request.user:
        return Response({"error": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # 수정 로직 (partial=True로 일부 필드만 수정 가능)
        serializer = ConsultationSerializer(consultation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        consultation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)