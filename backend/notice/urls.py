from django.urls import path
from . import views

urlpatterns = [
    # 대시보드 공지 목록 (시스템 + 강의 공지 통합)
    path('dashboard/notices/', views.dashboard_notice_list_api, name='dashboard-notices'),
    
    # 시스템 공지 상세
    path('notices/<int:pk>/', views.notice_detail_api, name='system-notice-detail'),
    
    # 시스템 공지 생성/수정/삭제 (관리자용)
    path('system/create/', views.system_notice_create_api), # 공지 작성
    path('system/', views.system_notice_list_api),          # 공지 목록
    path('system/<int:pk>/', views.system_notice_update_delete_api, name='system-notice-update-delete'),
    # path("create/", views.create_notice_api), # 공지 생성
    # path("", views.notice_list_api),
]