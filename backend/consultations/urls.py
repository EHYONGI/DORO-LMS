# backend/consultations/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("", views.consultation_list_create_api),
    path("instructors/", views.instructor_list_api),
    path("<int:pk>/", views.consultation_detail_api), # [추가] 상세/수정/삭제 URL
]