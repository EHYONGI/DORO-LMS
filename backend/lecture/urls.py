# backend/lecture/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ========== 학생용 과제 제출 (순서 중요: 변수형 URL보다 위에 배치) ==========
    # 'assignments/'로 시작하는 구체적인 경로를 먼저 배치하여 충돌 방지
    path('assignments/<int:assignment_id>/my-submission/', views.my_submission_api, name='my-submission'),
    path('assignments/<int:assignment_id>/submit/', views.submit_assignment_api, name='submit-assignment'),

    # ========== 학생용 API (기존) ==========
    # 내 강의 목록
    path('my-courses/', views.my_course_list_api, name='my-courses'),

    # 내 과제 목록
    path('my-tasks/', views.my_task_list_api, name='my-tasks'),
    path('courses/<int:lecture_id>/assignments/', views.course_assignment_list_api, name='course-assignments'),

    # 공지사항 (강의별 목록)
    path('courses/<int:lecture_id>/notices/', views.course_notice_list_api, name='course-notices'),
    # 공지 상세
    path('notices/<int:notice_id>/', views.lecture_notice_detail_api, name='lecture-notice-detail'),

    # 출결
    path('courses/<int:lecture_id>/attendance/', views.my_attendance_api, name='my-attendance'),


    # ========== 수강신청 / 강의 목록 ==========
    # 전체 강의 목록 (수강신청 페이지용)
    path('', views.get_all_lectures, name='all-lectures'),

    # 수강 취소
    path('enrollments/<int:enrollment_id>/', views.cancel_enrollment_api, name='cancel-enrollment'),


    # ========== 추천 시스템 ==========
    path('recommendations/', views.get_lecture_recommendations, name='lecture-recommendations'),
    path('recommendations/save/', views.save_lecture_recommendations, name='save-recommendations'),
    path('recommendations/saved/', views.get_saved_recommendations, name='get-saved-recommendations'),
    
    # 강의 상세
    path('<int:lecture_id>/detail/', views.get_lecture_detail_with_recommendation, name='lecture-detail-recommendation'),

    # 수강 신청 및 자격 확인
    path('enroll/', views.enroll_lecture_with_check, name='enroll-with-check'),
    path('<int:lecture_id>/eligibility/', views.check_enrollment_eligibility, name='check-eligibility'),


    # ========== 강사용 API ==========
    path('teacher/my-courses/', views.teacher_my_courses_api, name='teacher-my-courses'),
    path('<int:lecture_id>/assignments/', views.lecture_assignments_api, name='lecture-assignments'),
    path('<int:lecture_id>/students/', views.lecture_students_api, name='lecture-students'),
    path('<int:lecture_id>/attendance/week/<int:week>/', views.lecture_attendance_week_api, name='lecture-attendance-week'),
    path('<int:lecture_id>/notices/', views.lecture_notices_api, name='lecture-notices'),
    
    # 매니저 API
    path('manager/create/', views.manager_create_lecture_api, name='manager-lecture-create'),
    path('manager/list/', views.manager_lecture_list_api, name='manager-lecture-list'),
    path('manager/lectures/<int:lecture_id>/applications/', views.manager_lecture_applications_api, name='manager-lecture-apps'),
    path('manager/applications/<int:application_id>/process/', views.manager_application_process_api, name='manager-app-process'),
    path('manager/lectures/<int:lecture_id>/delete/', views.manager_lecture_delete_api, name='manager-lecture-delete'),
    path('manager/lectures/<int:lecture_id>/cancel-instructor/', views.manager_lecture_cancel_instructor_api, name='manager-lecture-cancel-instructor'),
    path('manager/lectures/<int:lecture_id>/close-enrollment/', views.manager_lecture_close_enrollment_api, name='manager-lecture-close-enrollment'),

    path('teacher/assignments/<int:assignment_id>/submissions/', views.teacher_assignment_submissions_api, name='teacher-assignment-submissions'),

    path('teacher/submissions/<int:submission_id>/grade/', views.grade_submission_api, name='grade-submission'),
]