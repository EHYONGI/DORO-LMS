from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Thread, Comment
from .serializers import ThreadSerializer, ThreadDetailSerializer, CommentSerializer

# 1. 게시글 목록 조회(GET) 및 작성(POST)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def community_list_create_api(request):
    if request.method == 'GET':
        lecture_id = request.query_params.get('lecture_id')
        
        if lecture_id:
            # 특정 강의 게시판 조회
            threads = Thread.objects.filter(lecture_id=lecture_id).order_by('-created_at')
        else:
            # 전체 게시판 (강의가 지정되지 않은 글 + 강의 글 모두 볼지, 아니면 구분할지 정책에 따라 다름)
            # 여기서는 '전체' 탭이므로 모든 글을 보여줍니다.
            threads = Thread.objects.all().order_by('-created_at')
            
        serializer = ThreadSerializer(threads, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ThreadSerializer(data=request.data)
        if serializer.is_valid():
            # lecture_id가 데이터에 포함되어 있으면 해당 강의 글이 됨
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. 게시글 상세 조회 (GET) - 댓글 포함
@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def community_detail_api(request, pk):
    thread = get_object_or_404(Thread, pk=pk)
    serializer = ThreadDetailSerializer(thread)
    return Response(serializer.data)

# 3. 댓글 작성 (POST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_create_api(request, pk):
    thread = get_object_or_404(Thread, pk=pk)
    serializer = CommentSerializer(data=request.data)
    
    if serializer.is_valid():
        # 작성자(user)와 게시글(thread) 정보를 함께 저장
        serializer.save(student=request.user, thread=thread)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 4. [추가됨] 내 활동 내역 (내가 쓴 글, 댓글) 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_activity_api(request):
    """내 활동 내역 (작성한 글, 댓글) 조회"""
    user = request.user
    
    # 내가 쓴 글
    my_threads = Thread.objects.filter(student=user).order_by('-created_at')
    thread_serializer = ThreadSerializer(my_threads, many=True)
    
    # 내가 쓴 댓글 (댓글이 달린 글의 제목도 같이 전달)
    my_comments = Comment.objects.filter(student=user).select_related('thread').order_by('-created_at')
    
    comment_data = []
    for comment in my_comments:
        # 댓글이 달린 게시글이 삭제되었을 경우를 대비해 try-except 처리를 하거나
        # select_related로 가져왔으므로 thread가 존재한다고 가정합니다.
        if comment.thread:
            comment_data.append({
                'id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at,
                'thread_id': comment.thread.id,
                'thread_title': comment.thread.title
            })

    return Response({
        'threads': thread_serializer.data,
        'comments': comment_data
    })