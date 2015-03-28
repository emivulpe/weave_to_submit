// Ensure that the content container and the navbar don't overlap
$("#content_container").css("padding-top", $("#teacher_navbar").height());

// A function to deal with resizing of the window
$(window).resize(function() {
    var navHeight = $("#teacher_navbar").height();
    $("#content_container").css("padding-top", navHeight);
});