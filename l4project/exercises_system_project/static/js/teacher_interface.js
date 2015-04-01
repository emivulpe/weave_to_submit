
// A function that populates the group list with the groups for a particular teacher.
// The parameters of this function specify which year and group element to update.
function populateGroupList(year_element, group_element) {

    $("#" + group_element).empty();
    var selectedYear = $("#" + year_element).val();

    var request = $.get('/weave/get_groups/', {
        year: selectedYear
    });
    request.done(function(groups) { // Extract a list of the relevant groups
        if ("error" in groups) {
            console.log("e");
        } else {
            if (year_element == "year") {
                $(".existing_groups_list").empty();
            }
            if (groups.length == 0) {
                $(".existing_groups_list").append("<span class='appended_groups'>None</span>");
            } else {
                for (var group_index in groups) {
                    var group = groups[group_index];
                    var option = "<option value='" + group + "' >" + group + "</option>";
                    $("#" + group_element).append(option);
                    if (group_element == "group_entry") {
                        $(".existing_groups_list").append("<span class='appended_groups'>" + group + " </span>");
                    }
                }
            }
        }

    });

};


// Ensure that the group list is populated with the groups for the selected year when a new year is chosen
$('.year').on('change', function() {
    populateGroupList($(this).attr('id'), nextInDOM('.group', $(this)).attr('id'));
});

// Show the correct elements depending on whether the user wants to create, update or delete a group
$("input[name='action']").change(function() {
    setGroupChoice();
    updateButtonText();
});

// Show the correct elements depending on whether the user wants to create, update or delete a group
function setGroupChoice() {

    var action = $('input[name=action]:checked').val();
    if (action == "register") {
        $(".update_group_specific").show();
        $("#group_id_select").hide();
        $(".register_group_specific").show();
    } else if (action == "update") {
        $(".update_group_specific").show();
        $(".register_group_specific").hide();
        $("#group_id_select").show();
    } else if (action == "delete") {
        $(".register_group_specific").hide();
        $(".update_group_specific").hide();
        $("#group_id_select").show();
    }

}

// Ensure the button is showing the correct text depending on the action required
function updateButtonText() {

    var action = $('input[name=action]:checked').val();
    if (action == "register") {

        $("#save_group_button").val("Register");
    } else if (action == "update") {
        $("#save_group_button").val("Update");
    } else if (action == "delete") {
        $("#save_group_button").val("Delete");
    }

}

var csrftoken = getCookie('csrftoken');


// Clear the textboxes on submit
$('button').each(function() {
    $(this).closest('form').find("input[type=text], textarea").val("");
    $("#id_username").val('');
});

// Ensure submission request is not sent now
$('#register_or_update_group_form').submit(function(e) {
    e.preventDefault();
});


// A function to show a success/unsuccess message after registering/updating a group
function showSuccessMessage(success, chosenGroup) {
    // Remove any previous success/unsuccess messages
    if ($(".success_icon").length) {
        $(".success_icon").remove();
    }

    // Show success/unsuccess messages to the user
    if (success) {
        $("#success_message").before("<i class='fa fa-check success_icon' style='color:green'></i>");
        $("#success_message").text(" Your changes to group " + chosenGroup + " have been saved!");
        $("#success_message").css("color", "green");
    } else {
        $("#success_message").before("<i class='fa fa-times success_icon' style='color:red'></i>");
        $("#success_message").text(" There was a problem making the changes to group " + chosenGroup + "! Please ensure you are entering a valid group name and number of pupils and try again!");
        $("#success_message").css("color", "red");
    }
    $("#success_dialog").dialog('open');
}


//A function to deal with the logic for choosing between registering and updating a group
$('#save_group_button').click(function() {
    var action = $('input[name=action]:checked').val(); // Get the action chosen
    var numStudents = $('#num_students').val(); // Get the number of students to add
    var chosenYear = document.getElementById("year").value; // Get the chosen academic year

    if (action == "register") {
        registerGroup(chosenYear, numStudents);
    } else if (action == "update") {
        updateGroup(chosenYear, numStudents);
    } else if (action == "delete") {
        deleteGroup(chosenYear);
    }

});



$(function() {

	// Define the actions for the success dialog
    $("#success_dialog").dialog({
        modal: true,
        autoOpen: false,
        buttons: {
            Ok: function() {
                $(this).dialog("close");
                location.reload(); // Reload the page to reflect the new changes
            }
        }
    });
	
	// Define the actions for the consent dialog
    $("#consent_dialog").dialog({
        width: $(window).width() * 0.9,
        modal: true,
        autoOpen: false,
        buttons: {
            "I agree": function() {
                $(this).dialog("close");
                $("#consent_value").val("true");
                $("#user_form").submit();
            },
            "Don't record data": function() {
                $(this).dialog("close");
                $("#consent_value").val("");
                $("#user_form").submit();
            }
        }
    });

});


$(document).ready(function() {
	// Submit the consent form
    $('#user_form').submit(function(e) {
        var consent_value = $('#consent_value').val();

        if (consent_value == '-1') {
            e.preventDefault();
            $('#consent_dialog').dialog('open');
        }
    });

});


// A function to ensure that only numbers are accepted when entering the number of students to add to a group 
function isNumber(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}


//from here: http://stackoverflow.com/questions/12873027/jquery-forget-the-dom-structure-just-find-the-next-element-with-this-class/12873187#12873187
function nextInDOM(_selector, _subject) {
    var next = getNext(_subject);
    while (next.length != 0) {
        var found = searchFor(_selector, next);
        if (found != null) return found;
        next = getNext(next);
    }
    return null;
}


// A function to get the next element in the DOM
function getNext(_subject) {
    if (_subject.next().length > 0) return _subject.next();
    return getNext(_subject.parent());
}

// A function to search for an element in the DOM
function searchFor(_selector, _subject) {
    if (_subject.is(_selector)) return _subject;
    else {
        var found = null;
        _subject.children().each(function() {
            found = searchFor(_selector, $(this));
            if (found != null) return false;
        });
        return found;
    }
    return null; 
}