from django.contrib.auth.models import AbstractUser
from django.db import models
from django_countries.fields import CountryField

# Create your models here.


class Role(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return f"{self.name}"


class User(AbstractUser):
    pass

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "last_login": self.last_login
        }

    def __str__(self):
        return f"{self.username}"


class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile")
    first_name = models.CharField(blank=False, max_length=64)
    last_name = models.CharField(blank=False, max_length=64)
    phone = models.CharField(blank=True, max_length=20)
    role = models.ForeignKey(
        Role, null=True, on_delete=models.SET_NULL, related_name="role")

    def serialize(self):
        return {
            "userid": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "phone": self.phone,
            "last_login": self.user.last_login,
            "full_name": self.first_name + " " + self.last_name,
            "role": self.role.name
        }

    def __str__(self):
        return f"{self.user.username}'s profile"


class Program(models.Model):
    name = models.CharField(blank=False, max_length=64)
    admins = models.ManyToManyField(User)
    description = models.TextField(blank=True, editable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "admins": self.admins
        }

    def __str__(self):
        return f"{self.name}"


class Stream(models.Model):
    name = models.CharField(blank=False, max_length=180)
    path = models.CharField(blank=True, max_length=64)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, blank=True, null=True, related_name="substream")
    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="streams")
    admins = models.ManyToManyField(User, blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "path": self.path,
            "program": self.program.name,
            "admins": self.admins
        }

    def __str__(self):
        if self.parent == None:
            return f"{self.program.name}: {self.name}"
        else:
            return f"{self.parent} - {self.name}"


class Roadmap(models.Model):
    name = models.CharField(blank=False, max_length=180)
    stream = models.ForeignKey(
        Stream, on_delete=models.CASCADE, related_name="roadmaps")
    path = models.CharField(blank=True, max_length=64)
    owner = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, related_name="roadmaps")
    description = models.TextField(blank=True, editable=True)
    created_on = models.DateField(auto_now_add=True)
    last_updated = models.DateField(blank=True, null=True)
    last_updater = models.ForeignKey(
        User, blank=True, null=True, on_delete=models.SET_NULL, related_name="updated")
    comments = models.TextField(blank=True, editable=True)
    country = CountryField()

    AME = 'AME'
    APAC = 'APAC'
    EMEA = 'EMEA'
    REGION = [
        (AME, 'AME'),
        (APAC, 'APAC'),
        (EMEA, 'EMEA')
    ]
    region = models.CharField(max_length=4, choices=REGION, default=None)

    def serialize(self):
        return {
            "id": self.id,
            "path": self.path,
            "name": self.name,
            "owner": self.owner.id,
            "stream": self.stream.id,
            "description": self.description,
            "comments": self.comments,
            "created_on": self.created_on,
            "last_updated": self.last_updated,
            "last_updater": self.last_updater.id,
            "region": self.region,
            "country": self.country.name
        }

    def __str__(self):
        return f"{self.stream.name}: {self.name}"


class Milestone(models.Model):
    number = models.PositiveSmallIntegerField(blank=True, editable=True)
    description = models.CharField(blank=False, editable=True, max_length=210)
    plan_date = models.DateField(blank=True, null=True, editable=True)
    forecast_date = models.DateField(blank=True, null=True, editable=True)
    realized = models.BooleanField(default=False)
    roadmap = models.ForeignKey(
        Roadmap, on_delete=models.CASCADE, related_name="milestones")

    def serialize(self):
        return {
            "id": self.id,
            "number": self.number,
            "description": self.description,
            "plan_date": self.plan_date,
            "forecast_date": self.forecast_date,
            "realized": self.realized,
            "roadmap": self.roadmap.id
        }

    def __str__(self):
        return f"{self.roadmap.name}: #{self.number} {self.description}"


class ImpactType(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return f"{self.name}"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }


class Impact(models.Model):
    impact_type = models.ForeignKey(
        ImpactType, on_delete=models.CASCADE, related_name="impacts")
    plan_amount = models.IntegerField(blank=True, null=True)
    forecast_amount = models.IntegerField(blank=True, null=True)
    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name="impacts")

    def serialize(self):
        return {
            "id": self.id,
            "impact_type": self.impact_type.name,
            "plan_amount": self.plan_amount,
            "forecast_amount": self.forecast_amount,
            "milestone": self.milestone.id
        }

    def __str__(self):
        if self.forecast_amount is None:
            return f"{self.milestone.roadmap.name}, #{self.milestone.number} {self.milestone.description}: {self.impact_type}, {self.plan_amount}"
        else:
            return f"{self.milestone.roadmap.name}, #{self.milestone.number} {self.milestone.description}: {self.impact_type}, {self.forecast_amount}"
