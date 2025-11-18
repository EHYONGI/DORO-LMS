from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup_api),
    path("login/", views.login_api),
    path("logout/", views.logout_api),
    path('withdraw/', views.withdraw_api),
    path("password/reset/", views.find_pw_api),
    path('me/', views.user_profile_api),
    path('overview/', views.user_overview_api),
]