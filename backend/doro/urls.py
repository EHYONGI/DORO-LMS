# backend/doro/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse  # ← 반드시 필요!!

from user import views as user_views
<<<<<<< HEAD
from consultations import views as consultation_views
=======
from notice import views as notice_views
from lecture import views as lecture_views
from consultations import views as consult_views
>>>>>>> parent of 777f554 (student 완성)


urlpatterns = [
    # ================================
    # 0. 기본 테스트용 엔드포인트
    # ================================
    path("ping/", lambda request: HttpResponse("pong")),

<<<<<<< HEAD
    path('api/user/instructors/', consultation_views.instructor_list_api),
    path('api/consult/list/', consultation_views.consultation_list_create_api),     # GET: 목록
    path('api/consult/request/', consultation_views.consultation_list_create_api),  # POST: 신청 (같은 뷰 재사용)

    # === 1. 대시보드 (Dashboard) API ===
=======

    # ================================
    # 1. 대시보드 API
    # ================================
    # 대시보드: 내 강의 목록
>>>>>>> parent of 777f554 (student 완성)
    path('api/dashboard/my-courses/', lecture_views.my_course_list_api),

    # 대시보드: 내 할 일 목록(과제)
    path('api/dashboard/tasks/', lecture_views.my_task_list_api),

<<<<<<< HEAD
    # === 2. 커뮤니티 (Community) API ===
    path('api/community/', community_views.community_list_create_api),
    path('api/community/<int:pk>/', community_views.community_detail_api),
    path('api/community/<int:pk>/comments/', community_views.comment_create_api),
    path('api/community/me/', community_views.my_activity_api),
    
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

    # === 4. 수강신청 & 추천 시스템 ===
    # lecture 앱 안의 나머지 URL들 (강의 목록, 수강신청 등)
    path('api/lectures/', include('lecture.urls')),
    
    # === 5. 유저 (User) API ===
=======
    # 대시보드: 시스템 + 강의 공지 통합 목록
    path('api/dashboard/notices/', notice_views.dashboard_notice_list_api),

    # 대시보드 공지 상세 조회
    path('api/dashboard/notices/<int:pk>/', notice_views.notice_detail_api),


    # ================================
    # 2. 강의(Lecture) 관련 API
    # ================================
    # 강의 상세 정보
    path('api/lecture/<int:lecture_id>/', lecture_views.lecture_detail_api),

    # 강의 공지 목록
    path('api/lecture/<int:lecture_id>/notices/', lecture_views.course_notice_list_api),

    # 강의 출결 (내 출결)
    path('api/lecture/<int:lecture_id>/attendance/', lecture_views.my_attendance_api),

    # 강사용 – 전체 학생 출결 조회
    path('api/lecture/<int:lecture_id>/attendance/all/', lecture_views.attendance_all_students_api),

    # 강사용 – 출결 업데이트
    path('api/lecture/<int:lecture_id>/attendance/update/', lecture_views.attendance_update_api),

    # 강의 과제 목록 (학생/강사)
    path('api/lecture/<int:lecture_id>/assignments/', lecture_views.assignment_list_api),

    # 과제 생성 (강사용)
    path('api/lecture/<int:lecture_id>/assignments/create/', lecture_views.assignment_create_api),

    # 과제 상세
    path('api/lecture/<int:lecture_id>/assignments/<int:assignment_id>/', lecture_views.assignment_detail_api),

    # 학생 과제 제출
    path('api/lecture/<int:lecture_id>/assignments/<int:assignment_id>/submit/', lecture_views.assignment_submit_api),


    # ================================
    # 3. 상담(Consultation) API
    # ================================
    path('api/counseling/list/', consult_views.consultation_list_create_api),
    path('api/counseling/create/', consult_views.consultation_list_create_api),
    path('api/counseling/<int:pk>/', consult_views.consultation_detail_api),


    # ================================
    # 4. 사용자(User) API
    # ================================
>>>>>>> parent of 777f554 (student 완성)
    path('api/user/signup/', user_views.signup_api),
    path('api/user/login/', user_views.login_api),
    path('api/user/logout/', user_views.logout_api),
    path('api/user/me/', user_views.user_profile_api),

<<<<<<< HEAD
    # === 6. 상담(Consultation) API ===
    path('api/consultations/', include('consultations.urls')),
    
    # === 7. 수강신청 / 강의 관련 (courses prefix) ===
    # 내 관심 강의 목록 조회 (GET)
    path('api/courses/wishlist', lecture_views.wishlist_list_api),
    # 관심 강의 추가/삭제 (POST, DELETE)
    path('api/courses/<int:lecture_id>/wishlist', lecture_views.wishlist_add_remove_api),
    # 수강 취소
    path('api/lectures/enrollments/<int:enrollment_id>/', lecture_views.cancel_enrollment_api),
]
=======

    # ================================
    # 5. 시스템 공지(SystemNotice) API
    # ================================
    path('api/system-notices/', notice_views.system_notice_create_api),
    path('api/system-notices/<int:pk>/', notice_views.system_notice_update_delete_api),
]
>>>>>>> parent of 777f554 (student 완성)
