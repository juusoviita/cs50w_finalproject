from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("request_account", views.request_account, name="request_account"),
    path("password-reset/", auth_views.PasswordResetView.as_view(
        template_name='workably/password_reset.html'), name="password_reset"),
    path("password-reset/done/", auth_views.PasswordResetDoneView.as_view(
        template_name="workably/password_reset_done.html"), name="password_reset_done"),
    path("password-reset-confirm/<uidb64>/<token>", auth_views.PasswordResetConfirmView.as_view(
        template_name="workably/password_reset_confirm.html"), name="password_reset_confirm"),
    path("password-reset-complete/", auth_views.PasswordResetCompleteView.as_view(
        template_name='workably/password_reset_complete.html'), name="password_reset_complete"),
    # API paths
    path("password", views.change_password, name="password"),
    path("programs", views.get_programs, name="get_programs"),
    path("stream", views.post_stream, name="post_stream"),
    path("streams", views.get_streams, name="get_streams"),
    path("streams/<int:program_id>", views.list_streams, name="list_streams"),
    path("roadmaps", views.get_roadmaps, name="get_roadmaps"),
    path("roadmaps/<int:stream_id>", views.list_roadmaps, name="list_roadmaps"),
    path("roadmap/<int:roadmap_id>", views.roadmap, name="get_roadmap"),
    path("roadmap", views.post_roadmap, name="post_roadmap"),
    path("editroadmap", views.edit_roadmap, name="edit_roadmap"),
    path("user/<int:user_id>", views.user, name="get_user"),
    path("profiles", views.profiles, name="get_profiles"),
    path("profile/<str:username>", views.profile, name="get_profile"),
    path("editprofile", views.edit_profile, name="edit_profile"),
    path("milestones/<int:roadmap_id>", views.milestones, name="get_milestones"),
    path("impacts", views.impacts, name="impacts"),
    path("impacts/<int:milestone_id>", views.get_impacts, name="get_impact"),
    path("postimpacts", views.post_impacts, name="post_impacts"),
    path("countries", views.country_list, name="countries"),
    path("regions", views.regions, name="regions"),
    path("impact_types", views.impact_types, name="impact_types"),
    path("milestone", views.milestone, name="milestone"),
    path("export", views.export, name="export")
]
