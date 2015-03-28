var currentStep = 0; // Stores the current step you're on. 0 means initial state.
var d = new Date();
var lastTime = d.getTime();
var csrftoken = getCookie('csrftoken');
var direction = "next";
var answer = "";
var explanation_dict = {}
var totalSteps = 1;
var last_direction = "next";
$("#btn_prev").css('visibility', 'hidden');
$("#btn_reset").css('visibility', 'hidden');
var multipleChoiceQuestion = false;
var textareaNum = 0;


// A function defining the actions the student interface needs to undertake at a particular step
function goToStep(direction) {

    totalSteps = steps.length; // Total number of possible steps
	
	// Unhighlight the previously newly appeared fragments (they are not new any more)
    $("*[id^='fragment_']").each(function() {
        if ($(this).css("background-color") == "rgb(255, 224, 255)") {
            $(this).css("background-color", "transparent");
        }
    });
	// Clear the explanation
    $('#explanation').html("");
	
	// Get the direction (coming from a previous or next step)
    direction = direction;
	
	// Ensure the next arrow is shown if needed
    if (currentStep == 0 && direction == "next") {
        $("#forward_button_label").text("Next");
        $("#forward_button_label").css('color', 'black');
        $("#forward_button_label").css('font-size', '14px');
        $("#next_arrow").show();

    }
	
	// Subtract a step if coming from the next step
    if (direction == "back") {

        if (currentStep < totalSteps) {
            currentStep--;
        } else {
            currentStep = totalSteps - 1;
        }
    }

	// Ensure the correct arrows are shown
    if (currentStep == totalSteps && direction == "next") {
        $("#btn_next").css('visibility', 'hidden');
        $('#explanation').html("Example complete! Well done!");

    } else if (currentStep == 0 && direction == "back") {
        $("#btn_prev").css('visibility', 'hidden');
    } else {
        $("#btn_prev").css('visibility', 'visible');
        $("#btn_next").css('visibility', 'visible');
        $("#btn_reset").css('visibility', 'visible');
    }
	
	// If this is a valid step- log the data for the previous step
    if (currentStep > 0) {
        var now = new Date().getTime();
        $.post("/weave/log_info_db/", {
            'time': (now - lastTime) / 1000,
            'step': currentStep,
            'direction': direction,
            'csrfmiddlewaretoken': csrftoken,
            'example_name': app_name
        });
        lastTime = now;
    }

	// Handle the valid step appropriately
    if (currentStep >= 0 && currentStep < totalSteps) {
        for (var i = 0; i < steps[currentStep].length; i++) {
            var currentAction = steps[currentStep][i];
            var text = currentAction[0];
            var action = currentAction[1];
            // If we want to go back, we need to reverse the action!
            if (direction == "back") {
                action = undoMapping[action];
            }

            if (action == "question") {
                if (direction == "next" && explanation_dict[currentStep] == undefined) {
                    var options = currentAction[2];
                    askQuestion(text, options);
                }
            } else {
                doAction(text, action); // Do the action! Show, hide, and (eventually) highlight/unhighlight.
            }

        }


		// Add the correct explanation
        if (direction == "next" && explanation_dict[currentStep] == undefined) {
            var explanationText = escapeHtml(answer) + '<br><strong>Step ' + (currentStep + 1) + "/" + totalSteps + ':</strong><br/>';
            // Add the explanation only
			if (action != "question") {
                explanationText += explanations[currentStep].substring(1, explanations[currentStep].length - 1);
                answer = "";
            } 
			// Add to the explanation the answer selected for the question in the previous step
			else {
                explanationText += text;
                for (var option_num = 0; option_num < options.length; option_num++) {
                    explanationText += "<br>" + options[option_num];
                }
            }
            $('#explanation').html(explanationText);
            explanation_dict[currentStep] = explanationText;
            currentStep++;

        } else if (direction == "next" && explanation_dict[currentStep] != undefined) {

            $('#explanation').html(explanation_dict[currentStep]);
            currentStep++;

        } else {

            $('#explanation').html(explanation_dict[currentStep - 1]);
        }
    }
	// Save the direction of the step transition
    last_direction = direction;
}


// When we go back, we need to undo what we did. So this maps an action to its inverse (e.g. when you revert a show, you hide it).
var undoMapping = {
    'showall': 'hide',
    'show': 'hide',
    'hide': 'show',
    'highlight': 'unhighlight',
    'unhighlight': 'highlight',
    'question': 'question',
}

// Reset an example- show only the relevant elements
function doReset() {
    $("*[id^='fragment_']").css("background-color", "transparent");
    $("*[id^='fragment_']").hide();
    $('#explanation').html('');
    $("#btn_prev").css('visibility', 'hidden');
    $("#btn_next").css('visibility', 'visible');
    $("#btn_reset").css('visibility', 'hidden');
    $("#forward_button_label").text('Start');
    $("#forward_button_label").css('cursor', 'pointer');
    $("#forward_button_label").css('color', 'red');
    $("#forward_button_label").css('font-size', '24px');
    $("#next_arrow").hide();


    currentStep = 0;
}

// A function specifying what action to be undertaken depending on the change required
function doAction(fragment, action) {
    var fragmentId = "fragment_" + fragment;
    var object = $('#' + fragmentId);
    if (action == "show") {
        object.show();
        object.css("background-color", "rgb(255, 224, 255)");
        contactTopPosition = object.position().top;
        object.parent().animate({
            scrollTop: contactTopPosition
        });
    } else if (action == "showall") {
        object.show();
    } else if (action == "hide") {
        object.hide();
    } else if (action == "highlight") {
        object.css("background-color", "rgb(255, 224, 194)");
        contactTopPosition = object.position().top;
        object.parent().animate({
            scrollTop: contactTopPosition
        });
    } else if (action == "unhighlight") {
        object.css("background-color", "transparent");
    }
}


// A function to open a question dialog
function askQuestion(questionText, options) {
    $('#question_text').text(questionText);
    $("#options").empty();

    //if no options provided, add a text box for answers
    if (options.length == 0) {
        multipleChoiceQuestion = false;
        var textAreaElement = "<textarea id='textarea_" + textareaNum + "' placeholder='Enter text here...' style = 'width:95%;height:150px' name='answer' form='usrform'></textarea>";
        $("#options").append(textAreaElement);
    } else {
        multipleChoiceQuestion = true;
        for (var option_num = 0; option_num < options.length; option_num++) {
            var option = options[option_num];
            var option_elem = "<input  class = 'option' id='option" + option_num + "'style = 'display: inline-block; vertical-align: middle; ' name='option' type='radio' value = '" + option + "' />" + "<label style = 'display: inline-block; vertical-align: middle; ' for='option" + option_num + "'>" + option + "</label><br>";
            $("#options").append(option_elem);
        }
    }
    ShowDialog();
}


// Use JQuery to pick up when the user pushes the next button.
$('#btn_next').click(function() {
    goToStep("next");
});


// Bind an event to the previous button.
$('#btn_prev').click(function() {
    goToStep("back");
});

// Reset the example on click of the reset button
$('#btn_reset').click(function() {
    doReset();
});


// Attaching the required actions on button clicks
$(document).ready(function() {
    $("#btnClose").click(function(e) {
        HideDialog();
        e.preventDefault();
    });

    $("#btnSubmit").click(function(e) {
        if (multipleChoiceQuestion) {
            answer = $(".options input:checked + label").text();
        } else {
            answer = $("#textarea_" + textareaNum).val();
            textareaNum++;
        }
        if (answer != "" && answer != undefined) {
            explanation_dict[currentStep - 1] = " You answered: " + answer + "<br>" + explanation_dict[currentStep - 1];
            HideDialog();
            e.preventDefault();
            var now = new Date().getTime();
            if (currentStep > 0) {
                $.post("/weave/log_question_info_db/", {
                    'time': (now - lastTime) / 1000,
                    'step': currentStep,
                    'answer': answer,
                    'example_name': app_name,
                    'csrfmiddlewaretoken': csrftoken,
                    'multiple_choice': multipleChoiceQuestion
                });
            }
            lastTime = now;
            answer = " You answered: " + answer;
            goToStep("next");
        }
    });

});


// Show the dialog for a question
function ShowDialog() {
    $("#overlay").show();
    $("#dialog").css({
        "position": "absolute",
        "top": ((($(window).height() - $("#dialog").outerHeight()) / 2) + $(window).scrollTop() + "px"),
        "left": ((($(window).width() - $("#dialog").outerWidth()) / 2) + $(window).scrollLeft() + "px"),
    });
    $("#dialog").fadeIn(300);

    $("#overlay").unbind("click");
}


// Hide a dialog of a question
function HideDialog() {
    $("#overlay").hide();
    $("#dialog").fadeOut(300);
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Specify the shortcut keys for transition between examples
document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            if (currentStep > 0 && $("#dialog").is(':hidden')) {
                goToStep("back");
            }
            break;
        case 39:
            if (currentStep <= totalSteps && $("#dialog").is(':hidden')) { //if the action is question that hasn't been asked yet, i.e. the explanation_dict is still empty for that step
                goToStep("next");
            }
            break;
    }
};

// A function to escape HTML to ensure the correct text for the examples appears
function escapeHtml(unsafe) {
    if (unsafe == null) {
        return "";
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}