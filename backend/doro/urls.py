# backend/doro/urls.py
from django.contrib import admin
from django.urls import path, include
from lecture import views as lecture_views
from notice import views as notice_views
from community import views as community_views
from user import views as user_views


urlpatterns = [
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
    path('api/lecture/<int:lecture_id>/notices/', lecture_views.course_notice_list_api),
    path('api/lecture/notices/<int:pk>/', lecture_views.lecture_notice_detail_api),
    path('api/lecture/<int:lecture_id>/assignments/', lecture_views.course_assignment_list_api),
    path('api/lecture/<int:lecture_id>/attendance/', lecture_views.my_attendance_api),
    
    # === [추가] 수강신청 & 추천 시스템 ===
    path('api/lectures/', include('lecture.urls')),  # ✅ 이 줄 추가!
    
    # === 4. 유저 (User) API ===
    path('api/user/signup/', user_views.signup_api),
    path('api/user/login/', user_views.login_api),
    path('api/user/logout/', user_views.logout_api),
    path('api/user/me/', user_views.user_profile_api),
    path('api/consultations/', include('consultations.urls')),
    
    # === 수강신청 / 강의 관련 (courses prefix) ===
    # 내 관심 강의 목록 조회 (GET)
    path('api/courses/wishlist', lecture_views.wishlist_list_api),

    # 관심 강의 추가/삭제 (POST, DELETE)
    path('api/courses/<int:lecture_id>/wishlist', lecture_views.wishlist_add_remove_api),
    
        # 수강 취소
    path('api/lectures/enrollments/<int:enrollment_id>/', lecture_views.cancel_enrollment_api),
]
