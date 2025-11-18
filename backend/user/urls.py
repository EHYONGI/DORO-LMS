from django.urls import path
from . import views

urlpatterns = [
    path("", views.practice),
    path("login/", views.login_api),
]