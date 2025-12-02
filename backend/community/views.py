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
    """
    학생 커뮤니티 게시글 목록 조회 / 새 글 작성

    - GET:
        - lecture_id 쿼리파라미터가 있으면 해당 강의 게시판 글만 조회
        - 없으면 전체 글 조회
    - POST:
        - ThreadSerializer를 사용해 새 글 작성
        - 작성자는 request.user (student 필드)로 저장
    """
    if request.method == 'GET':
        lecture_id = request.query_params.get('lecture_id')

        if lecture_id:
            # 특정 강의 게시판 조회
            threads = (
                Thread.objects
                .filter(lecture_id=lecture_id)
                .select_related('student', 'lecture')
                .order_by('-created_at')
            )
        else:
            # 전체 게시판 (강의 지정 여부 상관없이 모두)
            threads = (
                Thread.objects
                .all()
                .select_related('student', 'lecture')
                .order_by('-created_at')
            )

        serializer = ThreadSerializer(threads, many=True)
        return Response(serializer.data)

    # POST – 새 글 작성
    elif request.method == 'POST':
        serializer = ThreadSerializer(data=request.data)

        if serializer.is_valid():
            # serializer에서 lecture는 request.data에 넘어온 값(lecture pk)을 사용
            # 작성자는 무조건 현재 로그인한 user
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 2. 게시글 상세 조회 (GET) - 댓글 포함
@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def community_detail_api(request, pk):
    """
    특정 게시글 상세 조회 + 댓글 목록까지 함께 반환
    """
    thread = get_object_or_404(
        Thread.objects.select_related('student').prefetch_related('comments__student'),
        pk=pk,
    )
    serializer = ThreadDetailSerializer(thread)
    return Response(serializer.data)


# 3. 댓글 작성 (POST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_create_api(request, pk):
    """
    특정 게시글(pk)에 댓글 작성
    - URL의 pk는 Thread의 pk
    - 작성자는 request.user (student 필드)
    """
    thread = get_object_or_404(Thread, pk=pk)
    serializer = CommentSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(student=request.user, thread=thread)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 4. 내 활동 내역 (내가 쓴 글, 댓글) 조회
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_activity_api(request):
    """
    내 활동 내역 조회 API

    - 내가 쓴 게시글 목록 (threads)
    - 내가 쓴 댓글 목록 (comments)
      → 각 댓글에 달린 게시글의 id, title도 함께 내려줌
    """
    user = request.user

    # 내가 쓴 글
    my_threads = (
        Thread.objects
        .filter(student=user)
        .select_related('student', 'lecture')
        .order_by('-created_at')
    )
    thread_serializer = ThreadSerializer(my_threads, many=True)

    # 내가 쓴 댓글 (댓글이 달린 글의 제목도 같이 전달)
    my_comments = (
        Comment.objects
        .filter(student=user)
        .select_related('thread', 'student')
        .order_by('-created_at')
    )

    base_comment_serializer = CommentSerializer(my_comments, many=True)
    base_comment_data = list(base_comment_serializer.data)

    # 각 댓글에 thread 정보(thread_id, thread_title) 추가
    comments_with_thread = []
    for comment_obj, comment_dict in zip(my_comments, base_comment_data):
        comment_dict['thread_id'] = comment_obj.thread.id if comment_obj.thread else None
        comment_dict['thread_title'] = comment_obj.thread.title if comment_obj.thread else None
        comments_with_thread.append(comment_dict)

    return Response(
        {
            'threads': thread_serializer.data,
            'comments': comments_with_thread,
        }
    )