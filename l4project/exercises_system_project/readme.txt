This file describes what subdirectories are in this directory and what commands can be run when the command line is open in this directory.

From here you can:

######################## Create the database ####################

From this directory you can create the database for WEAVE by running the command: 
	python manage.py syncdb

You will be prompted whether you want to create a superuser account. This account will allow you to view the admin interface which can be found on 127.0.0.1:8000/admin when you are running it on the local server. In this interface you will be able to see the objects in the database. Remember that every time you add a new object class for the database in exerciser/models.py you need to register that class for the admin interface in the exerciser/admin.py by importing the object and adding the line admin.site.register(NameOfTheNewClass).

######################## Populate the database ####################

To populate the database you run the command:
	python population_script.py [absolute\path\to\the\files]

The command line argument is optional. It specifies the path to the xml files for the examples. Please note that all of them need to be in one directory. If you don't specify this command line argument, the population script will look for them in the examples subdirectory in this directory.


######################## Run the local server ####################

You can run the local server by running the command:
	python manage.py runserver


	
##################### Description of the subdirestories ################

In this directory you can find 6 subdirectories:

	1. examples- Here you can place the xml files created by the author interface of IWE. If you place them without placing them in any subdirectories inside, you can run the population_script.py file without any command line arguments and it will add to the database the examples in the files in this folder. If you want to specify a path to these files, please do so by providing the path as a command line argument. An example path would be: C:\path\to\the\files
	
	2. exerciser- Here is where the code for the application is placed.
	
	3. exercises_system_project- Here is where the settings for the project are placed.
	
	4. htmlcov- Here the files showing the coverage of the test cases are placed.
	
	5. static- Here are the static files for this project.These include the CSS, the JavaScript, the media files and the code for the external libraries used in this project.
	
	6. templates- Here are stored all the templates for the application.
	
	
##################### Description of the files ################
	
	1. .coverage- This is an automatically generated file for testing.
	
	2. exerciser.db- This is the database of WEAVE.
	
	3. manage.py- This is the manager for the project. The commands which are of interest are described above.
	
	4. population_script.py- This is the file which translates the xml elements created from the author interface of IWE into database objects.
	
	
	