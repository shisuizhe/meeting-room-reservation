import json
import datetime
from django.contrib import auth
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe

from app01 import models


def login(request):
    """
    登录
    :param request:
    :return:
    """
    if request.method == "GET":
        return render(request, "login.html")
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = auth.authenticate(username=username, password=password)
        if user:
            auth.login(request, user)
            return redirect("/")
        else:
            return render(request, "login.html")


def log_out(request):
    """
    退出登录
    :param request:
    :return:
    """
    auth.logout(request)
    return redirect("/")

def index(request):
    """
    首页
    :param request:
    :return:
    """
    now = datetime.datetime.now().date()
    book_date = request.GET.get("book_date", now)
    time_choices = models.BookRecord.time_choices
    room_list = models.MeetingRoom.objects.all()
    try:
        book_record_list = models.BookRecord.objects.filter(book_date=book_date)
    except Exception:
        book_record_list = models.BookRecord.objects.filter(book_date=now)
    table_body_html = ""
    for room in room_list:
        table_body_html += "<tr><td>{}({})</td>".format(room.name, room.num)
        for time_choice in time_choices:
            book_flag = False  # 预定标志
            book_record = None
            for book_record in book_record_list:
                if book_record.room.pk == room.pk and book_record.time_id == time_choice[0]:
                    # 判断成立，意味这个单元格已被预定
                    book_flag = True
                    book_record = book_record
                    break
            if book_flag:
                if request.user.pk == book_record.user.pk:
                    table_body_html += "<td class='active-self item' room-id={} time-id={}>{}</td>".format(room.pk, time_choice[0], "我")
                else:
                    table_body_html += "<td class='active-others item' room-id={} time-id={}>{}</td>".format(room.pk, time_choice[0], book_record.user.username)
            else:
                table_body_html += "<td class='item' room-id={} time-id={}></td>".format(room.pk, time_choice[0])
        table_body_html += "</tr>"
    data = {
        "time_choices": time_choices,
        "table_body_html": mark_safe(table_body_html)
    }
    return render(request, "index.html", data)


def book_meeting_room(request):
    """
    处理预定
    :param request:
    :return:
    """
    rep = {"code": 1000}
    if not request.user.username:
        rep["code"] = 1001
        return JsonResponse(rep)
    post_data = json.loads(request.POST.get("post_data"))  # {"DEL":{"1":["3","7"]},"ADD":{"2":["1","2"],"3":["1"]}}
    choose_date = request.POST.get("choose_date")
    try:
        # 添加预定
        book_list = []
        for room_id, time_id_list in post_data["ADD"].items():
            for time_id in time_id_list:
                obj = models.BookRecord(user=request.user, room_id=int(room_id), time_id=int(time_id), book_date=choose_date)
                book_list.append(obj)
        models.BookRecord.objects.bulk_create(book_list)
        # 删除预定
        for room_id, time_id_list in post_data["DEL"].items():
            for time_id in time_id_list:
                models.BookRecord.objects.filter(room_id=room_id, user_id=request.user.pk, time_id=int(time_id), book_date=choose_date).delete()
    except Exception:
        rep["code"] = 1002
    return JsonResponse(rep)

