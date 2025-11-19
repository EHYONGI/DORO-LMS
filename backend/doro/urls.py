from django.contrib import admin
from django.urls import path, include
# 각 앱의 view 함수들을 직접 import
from lecture import views as lecture_views
from notice import views as notice_views
from community import views as community_views
from user import views as user_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # === 1. 대시보드 (Dashboard) API ===
    # 내 수강 목록
    path('api/dashboard/my-courses/', lecture_views.my_course_list_api),
    # 공지 목록 (통합: 시스템 공지 + 내 강의 공지)
    path('api/dashboard/notices/', notice_views.dashboard_notice_list_api),
    # 공지 상세
    path('api/dashboard/notices/<int:pk>/', notice_views.notice_detail_api),
    # 강의별 과제 현황
    path('api/dashboard/tasks/', lecture_views.my_task_list_api),

    # === 2. 커뮤니티 (Community) API ===
    # 글 목록 조회 및 작성 (GET, POST)
    path('api/community/', community_views.community_list_create_api),
    # 글 상세 조회 (:id -> <int:pk>)
    path('api/community/<int:pk>/', community_views.community_detail_api),
    path('api/community/<int:pk>/comments/', community_views.comment_create_api),
    path('api/community/me/', community_views.my_activity_api),
    # === 3. 강의 내부 기능 (Lecture Specific) ===
    path('api/lecture/<int:lecture_id>/notices/', lecture_views.course_notice_list_api),
    path('api/lecture/notices/<int:pk>/', lecture_views.lecture_notice_detail_api),
    path('api/lecture/<int:lecture_id>/assignments/', lecture_views.course_assignment_list_api),
    path('api/lecture/<int:lecture_id>/attendance/', lecture_views.my_attendance_api),
    # === 4. 유저 (User) API ===
    path('api/user/signup/', user_views.signup_api),
    path('api/user/login/', user_views.login_api),
    path('api/user/logout/', user_views.logout_api),
    path('api/user/me/', user_views.user_profile_api),
    path('api/consultations/', include('consultations.urls')), # include 사용하거나 직접 연결
]