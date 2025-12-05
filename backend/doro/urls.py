# backend/doro/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from lecture import views as lecture_views
from notice import views as notice_views
from user import views as user_views
from consultations import views as consultation_views


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/user/instructors/', consultation_views.instructor_list_api),
    path('api/consult/list/', consultation_views.consultation_list_create_api),     # GET: 목록
    path('api/consult/request/', consultation_views.consultation_list_create_api),  # POST: 신청 (같은 뷰 재사용)

    # === 1. 대시보드 (Dashboard) API ===
    path('api/dashboard/my-courses/', lecture_views.my_course_list_api),
    path('api/dashboard/notices/', notice_views.dashboard_notice_list_api),
    path('api/dashboard/notices/<int:pk>/', notice_views.notice_detail_api),
    path('api/dashboard/tasks/', lecture_views.my_task_list_api),

    # === 2. 커뮤니티 (Community) API ===
    path('api/community/', include('community.urls')),
    
    # === 3. 강의 내부 기능 (학생용) ===
    path('api/lecture/<int:lecture_id>/notices/', lecture_views.course_notice_list_api),
    # notice_id 이름에 맞게 수정
    path('api/lecture/notices/<int:notice_id>/', lecture_views.lecture_notice_detail_api),
    path('api/lecture/<int:lecture_id>/assignments/', lecture_views.course_assignment_list_api),
    path('api/lecture/<int:lecture_id>/attendance/', lecture_views.my_attendance_api),
    
    # === [추가] 3-1. 강사용 강의 관리 API ===
    path('api/teacher/my-courses/', lecture_views.teacher_my_courses_api),
    path('api/teacher/lectures/<int:lecture_id>/assignments/', lecture_views.lecture_assignments_api),
    path('api/teacher/lectures/<int:lecture_id>/students/', lecture_views.lecture_students_api),
    path('api/teacher/lectures/<int:lecture_id>/attendance/<int:week>/', lecture_views.lecture_attendance_week_api),
    path('api/teacher/lectures/<int:lecture_id>/notices/', lecture_views.lecture_notices_api),
    path('api/teacher/notices/<int:notice_id>/', lecture_views.lecture_notice_detail_api),
    
    # === [NEW] 3-2. 강사용 강의 지원 API ===
    path('api/teacher/applications/', lecture_views.teacher_applications_api),
    path('api/teacher/applications/<int:application_id>/', lecture_views.teacher_application_cancel_api),

    path('api/lectures/', include('lecture.urls')),
    
    path('api/user/', include('user.urls')),
    path('api/notice/', include('notice.urls')),

    path('api/consultations/', include('consultations.urls')),
    
    # === 7. 수강신청 / 강의 관련 (courses prefix) ===
    # 내 관심 강의 목록 조회 (GET)
    path('api/courses/wishlist', lecture_views.wishlist_list_api),
    # 관심 강의 추가/삭제 (POST, DELETE)
    path('api/courses/<int:lecture_id>/wishlist', lecture_views.wishlist_add_remove_api),
    # 수강 취소
    path('api/lectures/enrollments/<int:enrollment_id>/', lecture_views.cancel_enrollment_api),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)