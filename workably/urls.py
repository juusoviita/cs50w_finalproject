from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("adminview", views.adminview, name="adminview"),
    path("request_account", views.request_account, name="request_account"),
    path("reporting", views.reporting, name="reporting"),
    # API paths
    path("roadmaps", views.get_roadmaps, name="get_roadmaps")
]
