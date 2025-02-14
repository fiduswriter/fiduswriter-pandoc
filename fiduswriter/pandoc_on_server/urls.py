from django.urls import re_path

from . import views

urlpatterns = [
    re_path("^export/$", views.export, name="export"),
    re_path("^available/$", views.available, name="available"),
]
