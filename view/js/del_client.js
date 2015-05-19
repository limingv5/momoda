$(function () {
  var ids = $(".device [nat-id]").map(function (i, dom) {
    return $(dom).attr("nat-id");
  }).get();

  $(".device .del").click(function () {
    var li = $(".device li");
    var id = $(this).attr("nat-id");

    if (id) {
      ids = [id];
      li = $(this).parents("li");
    }

    if (ids && ids.length) {
      var c = confirm("确定要删除么？");
      if (c) {
        $.post(
          "/~api/client/del",
          {id: ids},
          function (data) {
            if (data.status) {
              li.remove();
            }
            else {
              alert("删除失败");
            }
          },
          "json"
        );
      }
    }
    else {
      alert("没有可删除的设备");
    }
  });
});
