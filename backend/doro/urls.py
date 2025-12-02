# backend/doro/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse  # ← 반드시 필요!!

from user import views as user_views
from notice import views as notice_views
from lecture import views as lecture_views
from consultations import views as consult_views


urlpatterns = [
    # ================================
    # 0. 기본 테스트용 엔드포인트
    # ================================
    path("ping/", lambda request: HttpResponse("pong")),


    # ================================
    # 1. 대시보드 API
    # ================================
    # 대시보드: 내 강의 목록
    path('api/dashboard/my-courses/', lecture_views.my_course_list_api),

    # 대시보드: 내 할 일 목록(과제)
    path('api/dashboard/tasks/', lecture_views.my_task_list_api),

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
    path('api/user/signup/', user_views.signup_api),
    path('api/user/login/', user_views.login_api),
    path('api/user/logout/', user_views.logout_api),
    path('api/user/me/', user_views.user_profile_api),


    # ================================
    # 5. 시스템 공지(SystemNotice) API
    # ================================
    path('api/system-notices/', notice_views.system_notice_create_api),
    path('api/system-notices/<int:pk>/', notice_views.system_notice_update_delete_api),
]
