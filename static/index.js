// 用来保存用户提交信息
var POST_DATA = {
    "ADD": {},
    "DEL": {}
};

// 为td绑定单击事件
function ClickTableTd() {
    $(".item").click(function () {
        var isLogin = $("#is-login");
        var user = isLogin.attr("user");
        if (user === "") {
            location.href = "/login/"
        } else {
            var roomId = $(this).attr("room-id");
            var timeId = $(this).attr("time-id");
            // 取消预定
            if ($(this).hasClass("active-self")) {
                $(this).removeClass("active-self").empty();
                if (POST_DATA.DEL[roomId]) {
                    POST_DATA.DEL[roomId].push(timeId);
                } else {
                    POST_DATA.DEL[roomId] = [timeId];
                }
            // 取消临时预定
            } else if ($(this).hasClass("active-checked")) {
                $(this).removeClass("active-checked").empty();
                if (POST_DATA.ADD[roomId].length === 1) {
                    delete POST_DATA.ADD[roomId];
                }
                else {
                    var index = POST_DATA.ADD[roomId].indexOf(timeId);
                    POST_DATA.ADD[roomId].splice(index, 1);
                }
            // 其他
            } else {
                // 他人已预定
                if ($(this).hasClass("active-others")) {
                    swal("该会议室已被他人预定")
                // 添加临时预定
                } else {
                    $(this).addClass("active-checked").text("我");
                    if (POST_DATA.ADD[roomId]) {
                        POST_DATA.ADD[roomId].push(timeId);
                    } else {
                        POST_DATA.ADD[roomId] = [timeId];
                    }
                }
            }
        }
        console.log(POST_DATA)
    })
}
ClickTableTd();

// 日期格式化方法
Date.prototype.pd = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,  //月份
        "d+": this.getDate(),       //日
        "h+": this.getHours(),      //小时
        "m+": this.getMinutes(),    //分
        "s+": this.getSeconds(),    //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// 日历插件
$("#datetimepicker").datetimepicker({
        minView: "month",
        format: "yyyy-mm-dd",
        language: "zh-CN",
        startDate: new Date(),
        autoclose: true,
        todayBtn: true,
}).on("changeDate", queryBookInfo);
function queryBookInfo(e) {
    CHOOSE_DATE = e.date.pd("yyyy-MM-dd");
    location.href = "/?book_date=" + CHOOSE_DATE;
}

// 日期
if (location.search.slice(11)){
    CHOOSE_DATE = location.search.slice(11)
} else {
    CHOOSE_DATE = new Date().pd("yyyy-MM-dd");
}

// 发送Ajax
$(".save").click(function () {
    $.ajax({
        url:"/book/",
        type:"post",
        data:{
           "csrfmiddlewaretoken": $("[name='csrfmiddlewaretoken']").val(),
           "choose_date": CHOOSE_DATE,
           "post_data": JSON.stringify(POST_DATA)
        },
        success: function (rep) {
            if (rep.code === 1000) {
                location.href = "/";
            } else if (rep.code === 1001){
                location.href = "login";
            } else {
                swal("预定的会议室已被他人预定");
                location.href = "/"
            }
        }
    })
});
