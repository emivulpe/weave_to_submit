/*
The functions in this script deal with resizing of panels.
*/


$(function($) {
    $(".resizable").resizable();
    $("#dialog").draggable();
    $("#panel_container").height($("#interface").height() * 0.7);
    $("#explanation_container").height($("#interface").height() * 0.3);
});

$("#explanation_container").bind('mouseup', function(e) {
    $("#panel_container").height($("#interface").height() - $("#explanation_container").height());
});


$("#explanation_container").bind('resize', function(e) {
    $("#panel_container").height($("#interface").height() - $("#explanation_container").height());
});

var explanationMaxHeight = 0.6 * $("#interface").height();
$("#explanation_container").resizable({
    maxHeight: explanationMaxHeight,
    handles: {
        n: document.getElementById("north"),
    }
});

$("#panel_container").colResizable({
    liveDrag: true,
    gripInnerHtml: "<div class='grip'></div>",
    draggingClass: "dragging"
});