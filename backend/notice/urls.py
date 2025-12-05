from django.urls import path
from . import views

urlpatterns = [
    path("", views.practice),
    # 대시보드 공지 목록 (시스템 + 강의 공지 통합)
    path('dashboard/notices/', views.dashboard_notice_list_api, name='dashboard-notices'),
    
    # 시스템 공지 상세
    path('notices/<int:pk>/', views.notice_detail_api, name='system-notice-detail'),
    
    # 시스템 공지 생성/수정/삭제 (관리자용)
    path('system-notices/create/', views.system_notice_create_api, name='system-notice-create'),
    path('system-notices/<int:pk>/', views.system_notice_update_delete_api, name='system-notice-update-delete'),
]