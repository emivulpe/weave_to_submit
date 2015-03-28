
// A function to get the data for the next step selected by the teacher
function getNextStepData() {

    if (step < maxStep) {
        step++;
        selectedYear = document.getElementById("group_year").value // Get the selected year
        selectedApplication = $("#application").val(); // Get the selected application
        selectedGroup = document.getElementById("group_list").value; // Get the selected group
        selectedOption = document.getElementById("statistics_options").value;
        url = '/weave/update_class_steps_graph/';
        var selectedItems = {
            'application': selectedApplication,
            'group': selectedGroup,
            'year': selectedYear,
            'step': step
        };
        var chartDetails = {
            "xAxisTitle": "Students",
            "yAxisTitle": "Time",
            "seriesName": selectedApplication + "- Group " + selectedGroup,
            "chartType": "column",
            "selectedOption": "Class Steps",
            "chartSubtitle": "Step " + step
        }
        drawChartMerged(selectedItems, chartDetails, selectedOption, url, "container");
    }

    if (step >= maxStep) {
        $("#next_step_button").css('visibility', 'hidden');
    } else {
        $("#next_step_button").css('visibility', 'visible');
    }

    if (step > 1) {
        $("#prev_step_button").css('visibility', 'visible');
    } else {
        $("#prev_step_button").css('visibility', 'hidden');
    }
};


// A function to get the data for the previous step selected by the teacher
function getPrevStepData() {

    if (step > 1) {
        step--;
        selectedYear = document.getElementById("group_year").value // Get the selected year
        selectedApplication = $("#application").val(); // Get the selected application
        selectedGroup = document.getElementById("group_list").value; // Get the selected group
        selectedOption = document.getElementById("statistics_options").value;
        url = '/weave/update_class_steps_graph/';
        var selectedItems = {
            'application': selectedApplication,
            'group': selectedGroup,
            'year': selectedYear,
            'step': step
        };
        var chartDetails = {
            xAxisTitle: "Students",
            yAxisTitle: "Time",
            seriesName: selectedApplication + "- Group " + selectedGroup,
            "chartType": "column",
            selectedOption: "Class Steps",
            "chartSubtitle": "Step " + step
        }
        drawChartMerged(selectedItems, chartDetails, selectedOption, url, "container");
    }

    if (step >= maxStep) {
        $("#next_step_button").css('visibility', 'hidden');
    } else {
        $("#next_step_button").css('visibility', 'visible');
    }

    if (step > 1) {
        $("#prev_step_button").css('visibility', 'visible');
    } else {
        $("#prev_step_button").css('visibility', 'hidden');
    }
};


// Logic for handling selection of requested information
$('#statistics_options').on('change', function() {
    selected_option = document.getElementById("statistics_options").value;

    // Apply logic specific to the answers selection
    if (this.value == "Student Answers") {
        $("#application").val(''); // Reset applications in case the user had selected an application without questions
        $("#application").autocomplete('option', 'source', Object.keys(app_questions_dict)); // Change the autocomplete list to the relevant applications only ( i.e. the ones that have questions)
        $("#question_list").show(); // Show the selection for the questions
        $("#student_list").hide(); // Hide the selection for the students
        $("#step_list").hide();
    } else if (selected_option == "Student Time") {
        $("#student_list").show(); // Show the selection for the students
        $("#question_list").hide(); // Hide the questions selection -no interest in being there
        $("#step_list").hide();
    } else if (selected_option == "Class Steps") {
        $("#student_list").hide(); // Show the selection for the students
        $("#question_list").hide(); // Hide the questions selection -no interest in being there
        $("#step_list").show();
    }

    // Apply logic specific for any other selection
    else {
        $("#application").autocomplete('option', 'source', applications); // Change the autocomplete list to all applications
        $("#question_list").hide(); // Hide the questions selection -no interest in being there
        $("#student_list").hide(); // Hide the selection for the students
        $("#step_list").hide();
    }
});

// Update the question selection to the questions for the selected application
$("#application").mouseover(function() {
    $("#application").bind('mouseup', function() {
        $("#application").bind('mouseout', function() {
            $("#question_list").bind('mouseover', function() {
                addQuestions()
            });
            $("#step_list").bind('mouseover', function() {
                addSteps()
            });
            $("#application").unbind('mouseup');
            $("#application").unbind('mouseout');
        });
    });
});

// Update the student selection to the students for the selected academic year and group
$("#group_list").on('change', function() {
    selectedGroup = document.getElementById("group_list").value;
    selectedYear = document.getElementById("group_year").value;
    addStudents(selectedYear, selectedGroup);
});

// A function to define the series format of a graph
function seriesFormat(el, selectedOption) {

    if (selectedOption == "Average Time" || selectedOption == "Student Time") {
        return Highcharts.numberFormat(el.y, 1) + ' s (' + el.point.revisited_count + ')'
    } else if (selectedOption == "Student Answers") {
        return el.y + ' times'
    } else if (selectedOption == "Class Steps") {
        return Highcharts.numberFormat(el.y, 1) + ' s'
    } else {
        return el.y
    }
}

// A function to define the tooltip format of a graph
function tooltipFormat(el, selectedOption) {

    if (selectedOption == "Average Time" || selectedOption == "Student Time") {
        return ' ' +
            'Average time: ' + Highcharts.numberFormat(el.point.y, 1) + ' s<br />' +
            'Revisited: ' + el.point.revisited_count + ' times<br />' +
            'Explanation: ' + el.point.explanation_start + '<br />';
    } else if (selectedOption == "Student Answers") {
        return 'Times Chosen: ' + el.point.y + '<br/>' +
            'Students: ' + el.point.students;
    } else if (selectedOption == "Class Steps") {
        return "Time: " + Highcharts.numberFormat(el.point.y, 1) + " s";
    } else {
        return el.point.y;
    }
}

// A function to define what chart to be drawn
function drawChartMerged(selectedItems, chartDetails, selectedOption, url, chartContainer) {

    chartType = chartDetails["chartType"];
    chartSubtitle = chartDetails["chartSubtitle"];
    var xAxisTitle = chartDetails["xAxisTitle"];
    var yAxisTitle = chartDetails["yAxisTitle"];
    var seriesName = chartDetails["seriesName"];
    questionSteps = [];
    categories = [];
    var request = $.get(url, selectedItems);
    request.done(function(selected_data) {

        if ("error" in selected_data) {
            $('#container').find('.highcharts-container').hide();
            $('#container').html("<div class='no_stats_info'><br\><br\><br\><br\><br\><br\><i class='fa fa-asterisk' style='color:red'></i><span style='color:red'>Invalid selection</span><div>");
            $("#prev_step_button").css('visibility', 'hidden');
            $("#next_step_button").css('visibility', 'hidden');

        } else if ("no_data" in selected_data) {
            $('#container').find('.highcharts-container').hide();
            $('#container').html("<div class='no_stats_info'><br\><br\><br\><br\><br\><br\><i class='fa fa-asterisk' style='color:red'></i><span style='color:red'>There are no statistics for the current selection</span><div>");
            if (selectedOption == "Class Steps") {

                if (step > 1) {
                    $("#prev_step_button").css('visibility', 'visible');
                }
                if (step < maxStep) {
                    $("#next_step_button").css('visibility', 'visible');
                }
            }
        } else if ("open_question" in selected_data) {
            $('#' + chartContainer).find('.highcharts-container').hide();
            $('#' + chartContainer).html("<div class='no_stats_info'><br\><br\><br\><br\><br\><br\><i class='fa fa-asterisk' style='color:red'></i><span style='color:red'>No information is currently shown for open questions. This feature will be addressed in a future version of WEAVE.</span><div>");
        } else {

            if (Object.getOwnPropertyNames(selected_data).length != 0) {
                sel_data = selected_data["data"]; 

                if (sel_data.length > 0) {
                    if (selectedOption == "Average Time" || selectedOption == "Student Time") {
                        questionSteps = selected_data["question_steps"];
                        if (sel_data.length > 0) {
                            for (i = 0; i < sel_data.length; i++) {
                                if (questionSteps.indexOf(i + 1) != -1) {
                                    categories[i] = "? " + (i + 1);
                                } else {
                                    categories[i] = (i + 1);
                                }
                            }
                        }
                    } else if (selectedOption == "Student Answers" || selectedOption == "Class Steps") {
                        if (selectedOption == "Class Steps") {
                            if (step > 1) {
                                $("#prev_step_button").css('visibility', 'visible');
                            }
                            if (step < maxStep) {
                                $("#next_step_button").css('visibility', 'visible');
                            }
                        }
                        sel_data = selected_data["data"]; // Get the data
                        if (selectedOption == "Student Answers") {
                            chartSubtitle = selected_data["question"]; // Get the question text
                        }

                        var option_categories = []; // List for the categories
                        var option_data = []; // List for the data

                        // Populating the categories and the data
                        for (i = 0; i < sel_data.length; i++) {
                            for (var option in sel_data[i]) {

                                if ((typeof option) == "string" && option != "students") {
                                    option_categories.push(option.replace("&lt", "").replace("&gt", ""));
                                    option_data.push({
                                        "y": sel_data[i][option],
                                        "students": sel_data[i]["students"]
                                    });
                                }
                            }
                        }
                        sel_data = option_data;
                        categories = option_categories;

                    }
                    drawChart(chartContainer, selectedOption, chartType, selectedApplication, selectedGroup, chartSubtitle, categories, xAxisTitle, yAxisTitle, seriesFormat, chartClickHandler, questionSteps, seriesName, sel_data, tooltipFormat, selectedYear);
                } else {
                    if (selectedOption == "Class Steps") {
                        $('#' + chartContainer).find('.highcharts-container').hide();
                        $('#' + chartContainer).html("<div class='no_stats_info'><br\><br\><br\><br\><br\><br\><i class='fa fa-asterisk' style='color:red'></i><span style='color:red'>Class Steps only shows data if you have given your students IDs. If you have, they might not have attempted this step.</span><div>");
                    }

                }
            }
        }
    });
}

// A function to draw a chart
function drawChart(chartContainer, selectedOption, chartType, selectedApplication, selectedGroup, chartSubtitle, categories, xAxisTitle, yAxisTitle, formatter1Funct, clickFunct, clickFunctParameter, seriesName, chartData, formatter2Funct, selectedYear) {
    $('#' + chartContainer).highcharts({
        chart: {
            type: chartType
        },

        title: {
            text: selectedStatistics,
        },

        subtitle: {
            text: chartSubtitle
        },
        xAxis: {
            categories: categories,
            title: {
                text: xAxisTitle
            }
        },
        yAxis: {
            min: 0,
            allowDecimals: false,
            title: {
                text: yAxisTitle
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return formatter1Funct(this, selectedOption)
                    }
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function(e) {
                            return clickFunct(e, clickFunctParameter, selectedOption, this, selectedApplication, selectedYear, selectedGroup)
                        }
                    }
                },
                marker: {
                    lineWidth: 1
                }
            }
        },
        series: [{
            showInLegend: false,
            name: seriesName,
            data: chartData,
        }],
        tooltip: {
            formatter: function() {
                return formatter2Funct(this, selectedOption)
            }
        }
    });
}


// A function to define the actions when the teacher clicks on a chart
function chartClickHandler(e, questionSteps, selectedOption, el, selectedApplication, selectedYear, selectedGroup) {
    if (selectedOption == "Average Time" || selectedOption == "Student Time") {
        if (questionSteps.indexOf(el.x + 1) != -1) {
            hs.htmlExpand(null, {
                pageOrigin: {
                    x: e.pageX || e.clientX,
                    y: e.pageY || e.clientY
                },
                width: 600,
                height: 600,
                headingText: el.series.name,
                maincontentText: "	<div id='cont_" + chart_num + "'style='height:90%;width:90%;'> </div><br/> "
            });
            var selectedItems = {
                'app_name': selectedApplication,
                'group': selectedGroup,
                'year': selectedYear,
                'step': el.x + 1
            };
            if (selectedOption == "Student Time") {
                selectedStudent = document.getElementById("student_list").value;
                selectedItems["student"] = selectedStudent;
            }
            var chartOption = "Student Answers";
            var chartDetails = {
                "xAxisTitle": "Choices",
                "yAxisTitle": "Times chosen",
                "seriesName": selectedApplication + "- Group " + selectedGroup,
                "chartType": "column",
                "selectedOption": chartOption,
                "chartSubtitle": ""
            };
            var url = '/weave/get_question_data/';
            drawChartMerged(selectedItems, chartDetails, chartOption, url, "cont_" + chart_num);
            chart_num++;
        } else {
            hs.htmlExpand(null, {
                pageOrigin: {
                    x: e.pageX || e.clientX,
                    y: e.pageY || e.clientY
                },
                headingText: "Step Explanation",
                maincontentText: el.explanation
            });
        }
    }
}


// A function to parse the teacher's input and specify what chart to be drawn
$('#set_data_button').click(function() {
    $(".no_stats_info").remove(); // Clear any previous messages
    selectedYear = document.getElementById("group_year").value // Get the selected year
    selectedApplication = $("#application").val(); // Get the selected application
    var request = $.get("/weave/get_largest_step/", {
        "application": selectedApplication
    });
    request.done(function(largest_step) {
        if ("error" in largest_step) {
            maxStep = 0;
        } else {
            maxStep = largest_step["steps"];
        }
    });
    selectedGroup = document.getElementById("group_list").value; // Get the selected group
    selectedOption = document.getElementById("statistics_options").value;
    selectedStatistics = "Application: " + selectedApplication + " Year: " + selectedYear + " Group: " + selectedGroup + " Data Type: " + selectedOption;
    $("#prev_step_button").css('visibility', 'hidden');
    $("#next_step_button").css('visibility', 'hidden');
    if (selectedOption == "summary_data") {
        $("#container").hide();
        $("#summary_data").show();
        drawClassSummaryTable(selectedApplication, selectedGroup, selectedYear);
    } else {
        $("#container").show();
        $("#summary_data").hide();
        if (selectedOption == "Average Time") {
            var selectedItems = {
                "app_name": selectedApplication,
                "group": selectedGroup,
                "year": selectedYear
            };
            var chartDetails = {
                "chartType": "line",
                "chartSubtitle": "",
                "xAxisTitle": "Steps",
                "yAxisTitle": "Seconds",
                "seriesName": selectedApplication + "- Group " + selectedGroup
            };
            var url = '/weave/update_time_graph/';
            drawChartMerged(selectedItems, chartDetails, selectedOption, url, "container");
        } else if (selectedOption == "Student Answers") {
            question = document.getElementById("question_list").value;
            var selectedItems = {
                "app_name": selectedApplication,
                "group": selectedGroup,
                "year": selectedYear,
                "question": question
            };
            var chartDetails = {
                "xAxisTitle": "Choices",
                "yAxisTitle": "Times chosen",
                "seriesName": selectedApplication + "- Group " + selectedGroup,
                "chartType": "column",
                "selectedOption": "Student Answers",
                "chartSubtitle": ""
            };
            var url = '/weave/get_question_data/';
            drawChartMerged(selectedItems, chartDetails, selectedOption, url, "container");
        } else if (selectedOption == "Class Steps") {
            url = '/weave/update_class_steps_graph/';
            step = parseInt(document.getElementById("step_list").value);

            var selectedItems = {
                application: selectedApplication,
                group: selectedGroup,
                year: selectedYear,
                step: step
            };
            var chartDetails = {
                "xAxisTitle": "Students",
                "yAxisTitle": "Time",
                "seriesName": selectedApplication + "- Group " + selectedGroup,
                "chartType": "column",
                "selectedOption": "Class Steps",
                "chartSubtitle": "Step " + step
            }
            drawChartMerged(selectedItems, chartDetails, selectedOption, url, "container");
        } else if (selectedOption == "Student Time") {
            selectedStudent = document.getElementById("student_list").value;

            var selectedItems = {
                'app_name': selectedApplication,
                'group': selectedGroup,
                'year': selectedYear,
                'student': selectedStudent
            };
            var chartDetails = {
                "chartType": "line",
                "chartSubtitle": "",
                "xAxisTitle": "Steps",
                "yAxisTitle": "Seconds",
                "seriesName": selectedApplication + "- Group " + selectedGroup
            };
            var url = '/weave/update_time_graph/';
            drawChartMerged(selectedItems, chartDetails, selectedOption, url, "container");
        }
    }
});


// A function to draw the table for the class summary data
function drawClassSummaryTable(selectedApplication, selectedGroup, selectedYear) {
    $(".student_info").remove();
    $("#summary_data_caption").empty();
    var request = $.get('/weave/populate_summary_table/', {
        'application': selectedApplication,
        'group': selectedGroup,
        'year': selectedYear
    })
    request.done(function(summary_data) {
        if ("error" in summary_data) {
            $('#container').show();
            $('#summary_data').hide();
            $('#container').html("<div class='no_stats_info'><br\><br\><br\><br\><br\><br\><i class='fa fa-asterisk' style='color:red'></i><span style='color:red'>Invalid selection</span><div>");

        } else {
            for (student in summary_data["selected_data"]) {
                $("#summary_data").append("<tr id='student_" + student + "' class='student_info'></tr>");
                var studentData = summary_data[student];
                $("#student_" + student).append("<td>" + student + "</td>");
                $("#student_" + student).append("<td>" + summary_data["selected_data"][student]["total_time"].toFixed(1) + "</td>");
                $("#student_" + student).append("<td>" + summary_data["selected_data"][student]["num_steps_revisited"] + "</td>");
                $("#student_" + student).append("<td>" + summary_data["selected_data"][student]["last_step"] + "</td>");
            }
            $("#summary_data_caption").append(selectedApplication + " (" + summary_data["total_steps"] + " steps)");
            $("#summary_data").show();
        }
    });

}


// A function to populate the question selection with questions specific for the selected application
function addQuestions() {
    selectedApplication = $("#application").val();
    $("#question_list").unbind('mouseover');
    $("#question_info").prop("selected", true);
    $("#question_list").children().not(':first').remove();
    var request = $.get('/weave/get_application_questions/', {
        'application': selectedApplication
    });

    request.done(function(questions) {
        if (!("error" in questions)) {
            for (var question_index in questions) {
                var question = questions[question_index];
                var option = "<option value='" + question + "' >" + question + "</option>";

                if ($("#question_list").children().length < questions.length) {
                    $("#question_list").append(option);
                }
            }
        }
    });
}

// A function to populate the student selection with students specific for the selected group and year
function addStudents(selectedYear, selectedGroup) {
    $("#student_info").prop("selected", true);
    $("#student_list").children().not(':first').remove();
    var request = $.get('/weave/get_students/', {
        'group': selectedGroup,
        'year': selectedYear
    });

    request.done(function(students) {

        if (!("error" in students)) {
            for (var student_index in students) {
                var student = students[student_index];
                var option = "<option value='" + student + "' >" + student + "</option>";

                if ($("#student_list").children().length < students.length) {
                    $("#student_list").append(option);
                }
            }
        }
    });
}

// A function to populate the student selection with students specific for the selected group and year
function addSteps() {
    selectedApplication = $("#application").val();
    $("#step_list").unbind('mouseover');
    $("#step_info").prop("selected", true);
    $("#step_list").children().not(':first').remove();
    var request = $.get('/weave/get_steps/', {
        app_name: selectedApplication
    });

    request.done(function(steps) {
        if (!("error" in steps)) {
            for (var step_index in steps) {
                var step = steps[step_index];
                var option = "<option value='" + step + "' >" + step + "</option>";
                if ($("#step_list").children().length < steps.length) {
                    $("#step_list").append(option);
                }
            }
        }
    });
}

// Specify the list of applications for the autocomplete for the application selection
$(function() {
    $("#application").autocomplete({
        minLength: 0,
        source: applications
    }).focus(function() {
        $(this).autocomplete("search", "");
    });
});
// Choose the available groups for the selected academic year
$('.year').on('change', function() {
    populateGroupList($(this).attr('id'), nextInDOM('.group', $(this)).attr('id'));
});

function populateGroupList(year_element, group_element) {
        $("#" + group_element).children().not(':first').remove(); // Remove any previously shown groups
        var selectedYear = $("#" + year_element).val(); // Get the selected year


        var request = $.get('/weave/get_groups/', {
            year: selectedYear
        });
        request.done(function(groups) { // Extract a list of the relevant groups
            if (!("error" in groups)) {
                for (var group_index in groups) {
                    var group = groups[group_index];
                    var option = "<option value='" + group + "' >" + group + "</option>";
                    $("#group_list").append(option);
                }
            }
        });
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

// A function for the shortcuts for transitions between the steps
document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            if (step > 0) {
                getPrevStepData();
            }
            break;
        case 39:
            if (step < maxStep) {
                getNextStepData();
            }
            break;
    }
};