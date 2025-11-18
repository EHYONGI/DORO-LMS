from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Thread
from .serializers import ThreadSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly]) # 읽기는 누구나, 쓰기는 로그인필요
def community_list_create_api(request):
    """커뮤니티 글 목록(GET) 및 작성(POST)"""
    
    if request.method == 'GET':
        threads = Thread.objects.all().order_by('-created_at')
        serializer = ThreadSerializer(threads, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ThreadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=request.user) # 작성자 자동 저장
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def community_detail_api(request, pk):
    """커뮤니티 글 상세 조회 (GET /api/community/:id)"""
    thread = get_object_or_404(Thread, pk=pk)
    serializer = ThreadSerializer(thread)
    return Response(serializer.data)