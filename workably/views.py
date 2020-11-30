from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.urls import reverse

import json

from .models import Role, User, Profile, Program, Stream, Roadmap, Milestone, ImpactType, Impact

# Create your views here.


def get_roadmaps(request):
    user = request.user
    # if user is superuser, get all of the roadmaps
    if user.is_superuser == True:
        program = Program.objects.filter(admins=user)
        streams = Stream.objects.filter(program=program)
        roadmaps = Roadmap.objects.all()

    # if user is a Roadmap owner
    if user.profile.role.name == 'Roadmap owner':
        roadmaps = Roadmap.objects.filter(owner=user)

    # if user is a Program admin
    if user.profile.role.name == 'Program admin':
        program = Program.objects.filter(admins=user)
        streams = Stream.objects.filter(program=program)
        roadmaps = Roadmap.objects.filter(stream__in=streams)

    return JsonResponse([roadmap.serialize() for roadmap in roadmaps], safe=False)


def reporting(request):
    return render(request, "workably/reporting.html")


def adminview(request):
    return render(request, "workably/adminview.html")


def index(request):
    return render(request, "workably/index.html")


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]
        email = request.POST["email"]
        phone = request.POST["phone"]
        role = request.POST["role"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "workably/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user & profile object
        try:
            user = User.objects.create_user(username, email, password)
            user.save()

            role = Role.objects.get(name=role)

            profile = Profile(user=user, first_name=first_name,
                              last_name=last_name, phone=phone, role=role)
            profile.save()

        except IntegrityError:
            return render(request, "workably/register.html", {
                "message": "Username already taken."
            })
        return HttpResponseRedirect(reverse("index"))
    else:
        roles = Role.objects.all()
        return render(request, "workably/register.html", {
            "roles": roles
        })


def request_account(request):
    if request.method == "POST":
        requester_name = request.POST["requester_name"]
        requester_email = request.POST["requester_email"]
        request_message = request.POST["request_message"]

        print(requester_name, requester_email, request_message)

        # render also a message telling that your request has been sent
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "workably/request_account.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "workably/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "workably/login.html")


def logout_view(request):
    # insert a change here
    logout(request)
    return HttpResponseRedirect(reverse("index"))
