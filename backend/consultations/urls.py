# backend/consultations/urls.py
from django.urls import path
from . import views
from consultations import views as consultation_views

urlpatterns = [

    path('api/consultations/instructors/', consultation_views.instructor_list_api),
    
    # 학생용 API
    path("", views.consultation_list_create_api),
    path("instructors/", views.instructor_list_api),
    path("<int:pk>/", views.consultation_detail_api),
    
    # 강사용 API
    path("instructor/list/", views.instructor_consultation_list_api),  
    path("<int:pk>/status/", views.update_consultation_status_api),    
]