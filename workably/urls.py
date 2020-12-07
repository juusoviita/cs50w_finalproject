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
    path("roadmaps", views.get_roadmaps, name="get_roadmaps"),
    path("roadmap/<int:roadmap_id>", views.roadmap, name="get_roadmap"),
    path("editroadmap", views.edit_roadmap, name="edit_roadmap"),
    path("user/<int:user_id>", views.user, name="get_user"),
    path("profiles", views.profiles, name="get_profiles"),
    path("milestones/<int:roadmap_id>", views.milestones, name="get_milestones"),
    path("impacts/<int:milestone_id>", views.impacts, name="get_impact"),
    path("postimpacts", views.post_impacts, name="post_impacts"),
    path("countries", views.country_list, name="countries"),
    path("regions", views.regions, name="regions"),
    path("impact_types", views.impact_types, name="impact_types"),
    path("milestone", views.milestone, name="milestone")
]
