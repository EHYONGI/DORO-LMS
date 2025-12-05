from django.urls import path
from . import views

urlpatterns = [
    # ========== 학생용 API ==========

    # 내 강의 목록
    path('my-courses/', views.my_course_list_api, name='my-courses'),

    # 내 과제 목록
    path('my-tasks/', views.my_task_list_api, name='my-tasks'),
    path('courses/<int:lecture_id>/assignments/', views.course_assignment_list_api, name='course-assignments'),

    # 공지사항 (강의별 목록)
    path('courses/<int:lecture_id>/notices/', views.course_notice_list_api, name='course-notices'),
    # 공지 상세 (필요하면 사용 / 안 쓰면 지워도 됨)
    path('notices/<int:notice_id>/', views.lecture_notice_detail_api, name='lecture-notice-detail'),

    # 출결
    path('courses/<int:lecture_id>/attendance/', views.my_attendance_api, name='my-attendance'),


    # ========== 수강신청 / 강의 목록 ==========

    # 전체 강의 목록 (수강신청 페이지용)
    # ==> GET /api/lectures/
    path('', views.get_all_lectures, name='all-lectures'),

    # 수강 취소
    # ==> /api/lectures/enrollments/<id>/  (doro/urls.py에서도 직접 연결했으니, 둘 중 하나만 써도 됨)
    path('enrollments/<int:enrollment_id>/', views.cancel_enrollment_api, name='cancel-enrollment'),


    # ========== 추천 시스템 (수강신청 페이지) ==========

    # 실시간 추천
    # ==> GET /api/lectures/recommendations/
    path('recommendations/', views.get_lecture_recommendations, name='lecture-recommendations'),

    # 추천 저장/조회 (필요 시 사용)
    # ==> POST /api/lectures/recommendations/save/
    path('recommendations/save/', views.save_lecture_recommendations, name='save-recommendations'),
    # ==> GET /api/lectures/recommendations/saved/
    path('recommendations/saved/', views.get_saved_recommendations, name='get-saved-recommendations'),

    # 강의 상세 (추천 정보 포함)
    # ==> GET /api/lectures/<lecture_id>/detail/
    path('<int:lecture_id>/detail/', views.get_lecture_detail_with_recommendation, name='lecture-detail-recommendation'),

    # 수강 신청 (역량 체크 포함)
    # ==> POST /api/lectures/enroll/
    path('enroll/', views.enroll_lecture_with_check, name='enroll-with-check'),

    # 수강 자격 확인
    # ==> GET /api/lectures/<lecture_id>/eligibility/
    path('<int:lecture_id>/eligibility/', views.check_enrollment_eligibility, name='check-eligibility'),


    # ========== 강사용 API ==========

    # 강사가 담당하는 강의 목록
    # ==> GET /api/lectures/teacher/my-courses/
    path('teacher/my-courses/', views.teacher_my_courses_api, name='teacher-my-courses'),

    # 과제 관리 (GET + POST)
    # ==> /api/lectures/<lecture_id>/assignments/
    path('<int:lecture_id>/assignments/', views.lecture_assignments_api, name='lecture-assignments'),

    # 수강생 목록
    # ==> /api/lectures/<lecture_id>/students/
    path('<int:lecture_id>/students/', views.lecture_students_api, name='lecture-students'),

    # 출결 관리 (GET + POST)
    # ==> /api/lectures/<lecture_id>/attendance/week/<week>/
    path('<int:lecture_id>/attendance/week/<int:week>/', views.lecture_attendance_week_api, name='lecture-attendance-week'),

    # 공지사항 관리 (GET + POST)
    # ==> /api/lectures/<lecture_id>/notices/
    path('<int:lecture_id>/notices/', views.lecture_notices_api, name='lecture-notices'),
]