from exerciser.models import Application

# A function to ensure the correct spelling for the applications when they are present in a url
def applications(request):
	application_list = Application.objects.all()
	for application in application_list:
		application.url = application.name.replace(' ', '_')
	return {'applications' : application_list}