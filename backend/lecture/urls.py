# backend/lecture/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ========== 학생용 API ==========
    path('assignments/<int:assignment_id>/my-submission/', views.my_submission_api, name='my-submission'),
    path('assignments/<int:assignment_id>/submit/', views.submit_assignment_api, name='submit-assignment'),
    path('my-courses/', views.my_course_list_api, name='my-courses'),
    path('my-tasks/', views.my_task_list_api, name='my-tasks'),
    path('courses/<int:lecture_id>/assignments/', views.course_assignment_list_api, name='course-assignments'),
    path('courses/<int:lecture_id>/notices/', views.course_notice_list_api, name='course-notices'),
    path('notices/<int:notice_id>/', views.lecture_notice_detail_api, name='lecture-notice-detail'),
    path('courses/<int:lecture_id>/attendance/', views.my_attendance_api, name='my-attendance'),

    path('', views.get_all_lectures, name='all-lectures'),
    path('enrollments/<int:enrollment_id>/', views.cancel_enrollment_api, name='cancel-enrollment'),
    path('recommendations/', views.get_lecture_recommendations, name='lecture-recommendations'),
    path('recommendations/save/', views.save_lecture_recommendations, name='save-recommendations'),
    path('recommendations/saved/', views.get_saved_recommendations, name='get-saved-recommendations'),
    path('<int:lecture_id>/detail/', views.get_lecture_detail_with_recommendation, name='lecture-detail-recommendation'),
    path('enroll/', views.enroll_lecture_with_check, name='enroll-with-check'),
    path('<int:lecture_id>/eligibility/', views.check_enrollment_eligibility, name='check-eligibility'),


    # ========== 강사용 API ==========
    path('teacher/my-courses/', views.teacher_my_courses_api, name='teacher-my-courses'),
    path('<int:lecture_id>/assignments/', views.lecture_assignments_api, name='lecture-assignments'),
    path('<int:lecture_id>/students/', views.lecture_students_api, name='lecture-students'),
    path('<int:lecture_id>/attendance/week/<int:week>/', views.lecture_attendance_week_api, name='lecture-attendance-week'),
    path('<int:lecture_id>/notices/', views.lecture_notices_api, name='lecture-notices'),
    path('teacher/assignments/<int:assignment_id>/submissions/', views.teacher_assignment_submissions_api, name='teacher-assignment-submissions'),
    path('teacher/submissions/<int:submission_id>/grade/', views.grade_submission_api, name='grade-submission'),

    # ========== 매니저 API ==========
    path('manager/create/', views.manager_create_lecture_api, name='manager-lecture-create'),
    path('manager/list/', views.manager_lecture_list_api, name='manager-lecture-list'),
    path('manager/lectures/<int:lecture_id>/applications/', views.manager_lecture_applications_api, name='manager-lecture-apps'),
    path('manager/applications/<int:application_id>/process/', views.manager_application_process_api, name='manager-app-process'),
    path('manager/lectures/<int:lecture_id>/delete/', views.manager_lecture_delete_api, name='manager-lecture-delete'),
    path('manager/lectures/<int:lecture_id>/cancel-instructor/', views.manager_lecture_cancel_instructor_api, name='manager-lecture-cancel-instructor'),
    path('manager/lectures/<int:lecture_id>/close-enrollment/', views.manager_lecture_close_enrollment_api, name='manager-lecture-close-enrollment'),

]