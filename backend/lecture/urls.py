from django.urls import path
from . import views

urlpatterns = [  
   # 내 강의 목록
    path('my-courses/', views.my_course_list_api, name='my-courses'),
    
    # 과제
    path('my-tasks/', views.my_task_list_api, name='my-tasks'),
    path('courses/<int:lecture_id>/assignments/', views.course_assignment_list_api, name='course-assignments'),
    
    # 공지사항
    path('courses/<int:lecture_id>/notices/', views.course_notice_list_api, name='course-notices'),
    path('notices/<int:pk>/', views.lecture_notice_detail_api, name='notice-detail'),
    
    # 출결
    path('courses/<int:lecture_id>/attendance/', views.my_attendance_api, name='my-attendance'),
    
    
    # ========== 추천 시스템 (신규) ==========
    # 실시간 추천
    path('recommendations/', views.get_lecture_recommendations, name='lecture-recommendations'),
    
    # 추천 저장/조회
    path('recommendations/save/', views.save_lecture_recommendations, name='save-recommendations'),
    path('recommendations/saved/', views.get_saved_recommendations, name='get-saved-recommendations'),
    
    # 강의 상세 (추천 정보 포함)
    path('<int:lecture_id>/detail/', views.get_lecture_detail_with_recommendation, name='lecture-detail-recommendation'),
    
    # 수강 신청 (역량 체크 포함)
    path('enroll/', views.enroll_lecture_with_check, name='enroll-with-check'),
    
    # 수강 자격 확인
    path('<int:lecture_id>/eligibility/', views.check_enrollment_eligibility, name='check-eligibility'),
    
    # 전체 강의 목록 (수강신청 페이지용)
    path('', views.get_all_lectures, name='all-lectures'),
]