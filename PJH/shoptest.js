$(".item_box").on("mousedown", function () {
    $(this).find(".item_box_click").css("opacity", "1");
});

$(".item_box").on("mouseup mouseleave", function () {
    $(this).find(".item_box_click").css("opacity", "0");
});