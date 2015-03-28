# A class to disable the CSRF token
class DisableCSRF(object):
	def process_request(self, request):
		setattr(request, '_dont_enforce_csrf_checks', True)
