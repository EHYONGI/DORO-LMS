# backend/doro/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# 각 앱의 view 함수들을 직접 import
from lecture import views as lecture_views
from notice import views as notice_views
from community import views as community_views
from user import views as user_views

urlpatterns = [
    # 테스트용 핑 엔드포인트 (URLConf가 맞게 로딩되는지 확인용)
    path("ping/", lambda request: HttpResponse("pong")),

    path('admin/', admin.site.urls),

    # === 1. 대시보드 (Dashboard) API ===
    path('api/dashboard/my-courses/', lecture_views.my_course_list_api),
    path('api/dashboard/notices/', notice_views.dashboard_notice_list_api),
    path('api/dashboard/notices/<int:pk>/', notice_views.notice_detail_api),
    path('api/dashboard/tasks/', lecture_views.my_task_list_api),

    # === 2. 커뮤니티 (Community) API ===
    path('api/community/', community_views.community_list_create_api),
    path('api/community/<int:pk>/', community_views.community_detail_api),
    path('api/community/<int:pk>/comments/', community_views.comment_create_api),
    path('api/community/me/', community_views.my_activity_api),

    # === 3. 강의 내부 기능 (Lecture Specific) ===
    path(
        'api/lecture/<int:lecture_id>/notices/',
        lecture_views.course_notice_list_api,
    ),
    path(
        'api/lecture/notices/<int:pk>/',
        lecture_views.lecture_notice_detail_api,
    ),
    # ✅ 우리가 쓰는 과제 목록/생성 API
    path(
        'api/lecture/<int:lecture_id>/assignments/',
        lecture_views.course_assignment_list_api,
    ),
    path(
        'api/lecture/<int:lecture_id>/attendance/',
        lecture_views.my_attendance_api,
    ),

    # === 4. 유저 (User) API ===
    path('api/user/signup/', user_views.signup_api),
    path('api/user/login/', user_views.login_api),
    path('api/user/logout/', user_views.logout_api),
    path('api/user/me/', user_views.user_profile_api),

    # === 5. 상담(consultations) API ===
    path('api/consultations/', include('consultations.urls')),
    # 프론트에서 /api/counseling/... 을 쓰는 경우를 위한 별칭
    path('api/counseling/', include('consultations.urls')),
]
