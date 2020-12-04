from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.core import serializers
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.urls import reverse
from django_countries import countries

import json
import datetime

from .models import Role, User, Profile, Program, Stream, Roadmap, Milestone, ImpactType, Impact

# Create your views here.


def get_roadmaps(request):
    user = request.user
    # if user is superuser, get all of the roadmaps
    if user.is_superuser == True:
        programs = Program.objects.filter(admins=user)
        streams = Stream.objects.filter(program__in=programs)
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


def roadmap(request, roadmap_id):
    if request.method == "GET":
        roadmap = Roadmap.objects.filter(pk=roadmap_id)
        roadmap_json = serializers.serialize('json', roadmap)
        return HttpResponse(roadmap_json, content_type="text/json-comment-filtered")


@csrf_exempt
def edit_roadmap(request):
    if request.method == "PUT":
        data = json.loads(request.body)

        last_updater = request.user
        last_updated = datetime.date.today()

        roadmap_id = data.get("roadmap_id", "")
        new_name = data.get("name", "")
        new_owner = data.get("owner", "")
        new_description = data.get("description", "")
        new_country = data.get("country", "")
        new_region = data.get("region", "")

        Roadmap.objects.filter(pk=roadmap_id).update(name=new_name, description=new_description, owner=new_owner,
                                                     last_updated=last_updated, last_updater=last_updater, country=new_country, region=new_region)

        return JsonResponse({"result": "Roadmap edited"}, safe=False)


def milestones(request, roadmap_id):
    if request.method == "GET":
        # roadmap = Roadmap.objects.filter(pk=roadmap_id)
        milestones = Milestone.objects.filter(roadmap__id=roadmap_id)
        return JsonResponse([milestone.serialize() for milestone in milestones], safe=False)


@csrf_exempt
def milestone(request):
    if request.method == "POST":
        data = json.loads(request.body)

        number = data.get("number", "")
        description = data.get("desc", "")
        plan_date = data.get("plan_date", "")
        roadmap_id = data.get("roadmap", "")

        roadmap = Roadmap.objects.get(pk=roadmap_id)

        if plan_date == '':
            milestone = Milestone(
                number=number, description=description, roadmap=roadmap)
        else:
            milestone = Milestone(number=number, description=description,
                                  plan_date=plan_date, roadmap=roadmap)

        milestone.save()

        # update the roadmaps info to reflect the changes
        Roadmap.objects.filter(pk=roadmap_id).update(
            last_updated=datetime.date.today(), last_updater=request.user)

        return JsonResponse({"id": milestone.id}, safe=False)


def impacts(request, milestone_id):
    if request.method == "GET":
        impacts = Impact.objects.filter(milestone__id=milestone_id)
        if len(impacts) == 0:
            return JsonResponse({"message": "no impacts"}, safe=False)
        else:
            for impact in impacts:
                print(impact)
            return JsonResponse([impact.serialize() for impact in impacts], safe=False)

    return JsonResponse({"result": "done"}, safe=False)


def impact_types(request):
    impact_types = ImpactType.objects.all()
    return JsonResponse([impact_type.serialize() for impact_type in impact_types], safe=False)


def user(request, user_id):
    if request.method == "GET":
        user = User.objects.filter(pk=user_id)
        user_json = serializers.serialize('json', user)
        return HttpResponse(user_json, content_type="text/json-comment-filtered")


def profiles(request):
    profiles = Profile.objects.all()
    profiles = profiles.order_by("first_name")
    return JsonResponse([profile.serialize() for profile in profiles], safe=False)


def regions(request):
    regions = Roadmap.objects.order_by('region').values('region').distinct()
    regiondict = {}
    i = 1
    for region in regions:
        reg = region["region"]
        regiondict[i] = reg
        i += 1

    return JsonResponse({"regions": regiondict}, safe=False)


def country_list(request):
    country_dict = {}
    i = 1
    for code, name in list(countries):
        country_dict[i] = {"code": code, "name": name}
        i += 1

    return JsonResponse(country_dict, safe=False)


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
