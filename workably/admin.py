from django.contrib import admin

# Register your models here.
from .models import Role, User, Profile, Program, Stream, Roadmap, Milestone, ImpactType, Impact

admin.site.register(Role)
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Program)
admin.site.register(Stream)
admin.site.register(Roadmap)
admin.site.register(Milestone)
admin.site.register(ImpactType)
admin.site.register(Impact)
