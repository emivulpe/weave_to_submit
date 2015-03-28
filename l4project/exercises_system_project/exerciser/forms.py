from exerciser.models import Teacher
from django.contrib.auth.models import User
from django import forms

# A form to create a user profile
class UserForm(forms.ModelForm):
	username = forms.CharField()
	password = forms.CharField(widget=forms.PasswordInput())
	password2 = forms.CharField(widget=forms.PasswordInput())
	username.label = "Username:"
	password.label = "Password:"
	password2.label = "Confirm password:"

	class Meta:
		model = User
		fields = ('username', 'password')
		
	def __init__(self, *args, **kwargs):
		super(UserForm, self).__init__(*args, **kwargs)

		for fieldname in ['username']:
			self.fields[fieldname].help_text = None


			
	# Make sure the passwords are the same
	def clean(self):
		username = self.cleaned_data['username']
		if User.objects.exclude(pk=self.instance.pk).filter(username=username).exists():
			raise forms.ValidationError(u'Username "%s" is already in use. Please try with another username!' % username)

		password1 = self.cleaned_data.get('password')
		password2 = self.cleaned_data.get('password2')

		if password1 and password1 != password2:
			raise forms.ValidationError("Passwords don't match")

		return self.cleaned_data

