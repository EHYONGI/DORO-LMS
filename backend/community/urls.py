from django.urls import path
from . import views

urlpatterns = [
    # 게시글 목록 조회 / 작성
    path('', views.community_list_create_api, name='community-list-create'),
    
    # 게시글 상세 조회
    path('<int:pk>/', views.community_detail_api, name='community-detail'),
    
    # 댓글 작성
    path('<int:pk>/comments/', views.comment_create_api, name='comment-create'),
    
    # 내 활동 내역
    path('me/', views.my_activity_api, name='my-activity'),
]