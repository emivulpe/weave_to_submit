var tutorialStep = 0;
$('#btn_prev_step').click(function() {
    if (tutorialStep > 0) {
        tutorialStep--;
        goToTutorialStep(tutorialStep);
    }
});

$('#btn_next_step').click(function() {
    if (tutorialStep < 10) {
        tutorialStep++;
        goToTutorialStep(tutorialStep);
    }
});



var csrftoken = getCookie('csrftoken');
var teacher_name = "";
var academic_year = "";
var group_name = "";
var student_name = "";

chooseTeacherStep();

$('#detail_form').submit(function(e) {
    e.preventDefault();
});

function resetRegistration() {
    window.location = '/weave/reset_session/';
}


function storeDetails() {
    $(".details").hide();
    $("#application_list").show();
    window.location = '/weave/save_session_ids/';
    message = "You are using the application ";

    if (teacher_name != "") {
        message += "registered with teacher id" + teacher_name;

        if (group_name != "") {
            message += " , group id " + group_name + " (" + academic_year + ")"; 

            if (student_name != "") {
                message += " and pupil id " + student_name;
            }
        }
    } else {
        message += " anonymously";
    }
    message += ".";
}


function chooseTeacherStep() {

    teacher_name = "";
    academic_year = "";
    group_name = "";
    student_name = "";
    $("#teacher_details").show();
    $("#group_list").empty();
    $("#buttons").show();
    $("#year_details").hide();
    $("#group_details").hide();
    $("#student_details").hide();
    $("#back_button").hide();
    $("#submit_button").val("Next");
    $("#submit_button").attr('onclick', 'saveTeacher()');
    $("#no_id").val('No teacher ID');
    $("#unsuccess_message").text('');
}

function chooseGroupStep() {
    group_name = "";
    student_name = "";
    academic_year = "";
    $("#teacher_details").hide();
    $("#year_details").hide();
    $("#group_details").show();
    $("#student_details").hide();
    $("#back_button").show();
    $("#back_button").attr("onclick", "deleteGroup()");
    $("#submit_button").val("Next");
    $("#submit_button").attr('onclick', 'saveGroup()');
    $("#no_id").val('No group ID');
    $("#unsuccess_message").text('');
}

function chooseStudentStep() {
    student_name = "";
    $("#teacher_details").hide();
    $("#group_details").hide();
    $("#year_details").hide();
    $("#student_details").show();
    $("#back_button").show();
    $("#back_button").attr('onclick', 'deleteStudent()');
    $("#submit_button").val("Submit");
    $("#submit_button").prop("type", "submit");
    $("#submit_button").attr('onclick', 'saveStudent()');
    $("#no_id").val('No pupil ID');
    $("#unsuccess_message").text('');
}

function chooseYearStep() {
    teacher_name = "";
    academic_year = "";
    $("#teacher_details").hide();
    $("#group_details").hide();
    $("#year_details").show();
    $("#student_details").hide();
    $("#group_list").empty();
    $("#back_button").show();
    $("#back_button").attr('onclick', 'deleteYear()');
    $("#submit_button").val("Next");
    $("#submit_button").attr('onclick', 'saveYear()');
    $("#no_id").val('No year');
    $("#unsuccess_message").text('');
}


function deleteGroup() {
    $.post('/weave/del_session_variable/', {
        csrfmiddlewaretoken: csrftoken,
        to_delete: 'group'
    });
    chooseYearStep();
}


function deleteStudent() {
    $.post('/weave/del_session_variable/', {
        'csrfmiddlewaretoken': csrftoken,
        'to_delete': 'student'
    });
    chooseGroupStep();
}


function deleteYear() {
    $.post('/weave/del_session_variable/', {
        'csrfmiddlewaretoken': csrftoken,
        'to_delete': 'year'
    });
    chooseTeacherStep();
}


function saveStudent() {
    $("#unsuccess_message").text('');
    var student = $("#student").val();

    var request = $.post("/weave/register_student_with_session/", {
        'student': student,
        'csrfmiddlewaretoken': csrftoken
    });

    request.done(function(success) {

        if (success) {
            student_name = student;
            storeDetails();
            $("#back_button").hide();
        } else {

            $("#unsuccess_message").text("Sorry, but the pupil ID " + student + " is invalid.Please try again, or ask your teacher for the correct id.  If your teacher didn’t give you an id to work with, just press <No pupil ID>.");

        }
    });
};

function saveTeacher() {
    var teacher = $("#teacher").val();

    $("#buttons").hide();

    var request = $.post("/weave/register_teacher_with_session/", {
        'teacher': teacher,
        'csrfmiddlewaretoken': csrftoken
    });

    request.done(function(reply) {

        if (reply) {
            teacher_name = teacher;
            chooseYearStep();


        } else {

            $("#unsuccess_message").text("Sorry, but teacher ID " + teacher + " is invalid. Please, try again, or ask your teacher for the correct id.  If your teacher didn’t give you an id to work with, just press <No teacher ID> to continue!");
        }

        $("#buttons").show();
    });
}

function saveGroup() {

    $("#buttons").hide();
    var group = document.getElementById("group_list").value;

    var request = $.post("/weave/register_group_with_session/", {
        'group': group,
        'csrfmiddlewaretoken': csrftoken
    });

    request.done(function(success) {

        if (success) {

            group_name = group;

            chooseStudentStep();

        } else {
            $("#unsuccess_message").text("Sorry, but the group ID " + group + " is invalid. Please, try again, or ask your teacher for the correct id.  If your teacher didn’t give you an ID to work with, just press <No group ID> to continue!");
        }
        $("#buttons").show();
    });
}


function saveYear() {

    $("#buttons").hide();
    var year = document.getElementById("academic_year_select").value;
    var request = $.post("/weave/register_year_with_session/", {
        'year': year,
        'csrfmiddlewaretoken': csrftoken
    });

    request.done(function(success) {

        if (success) {
            
            groups_request = $.post("/weave/get_groups_for_year/", {
                'year': year,
                'csrfmiddlewaretoken': csrftoken
            });
            groups_request.done(function(groups) {
                for (var groupIndex in groups) {
                    var group = "<option value='" + groups[groupIndex] + "' >" + groups[groupIndex] + "</option>";
                    $("#group_list").append(group);
                }
            });

            academic_year = year;

            chooseGroupStep();

        } else {
            $("#unsuccess_message").text("Sorry, but the year " + group + " is invalid. Please, try again, or click <No year> button to continue!!");
        }
        $("#buttons").show();
    });
}
$('#application_search_box').keyup(function() {
    var valThis = $(this).val().toLowerCase();
    $('.navList>li').each(function() {
        var text = $(this).text().toLowerCase();
        (text.indexOf(valThis) == 0) ? $(this).show(): $(this).hide();
    });
});