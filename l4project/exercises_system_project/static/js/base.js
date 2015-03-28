// Ensure the main content of the page does not overlap with the navbar
$("#interface").css("padding-top", $("#navigation_bar").height() + 5);

// Deal with resizing of windows
$(window).resize(function() {
    var navHeight = $("#navigation_bar").height();
    $("#interface").css("padding-top", navHeight + 5);
});

// Deal with filtering when the user is typing in the name of the example
$(document).ready(function() {

    $('.navbar-collapse').on('show.bs.dropdown', function() {
        setTimeout(function() {
            $('#application_text').focus();
            $('#application_text').val("");
        }, 50);

        $('#application_text').blur(function() {
            $('#application_text').val("Select Application...");
        });

        $('#application_text').keyup(function() {
            var valThis = $(this).val().toLowerCase();
            $('#application_list>li').each(function() {
                var text = $(this).text().toLowerCase();
                (text.indexOf(valThis) == 0) ? $(this).show(): $(this).hide();
            });
        });
    })
})