from django.conf.urls import url
from django.contrib import admin
from app01 import views


urlpatterns = [
    url(r"^admin/", admin.site.urls),
    url(r"^login/$", views.login),
    url(r"^logout/$", views.log_out),
    url(r"^$", views.index),
    url(r"^book/$", views.book_meeting_room),
]
