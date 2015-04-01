from django.test import TestCase, Client
from exerciser.models import Application, User, Teacher, Step, Group, AcademicYear, Student, Question, Option
from django.utils import timezone
from django.core.urlresolvers import reverse
from django.conf import settings
from django.utils.importlib import import_module

#imports for views
from django.core.urlresolvers import reverse



# models test
class ApplicationTest(TestCase):

	def test_application_creation(self):
		app = Application.objects.get_or_create(name = 'test app')[0]
		self.assertTrue(isinstance(app, Application))
		self.assertEqual(app.__unicode__(), app.name)
		
		
class IndexViewTests(TestCase):

	def test_index_view_with_no_applications(self):
		response = self.client.get(reverse('index'))
		self.assertEqual(response.status_code, 200)
		self.assertQuerysetEqual(response.context['applications'], [])
		
	def test_index_view_with_applications(self):
		response = self.client.get(reverse('index'))
		app = Application.objects.get_or_create(name = 'test app')[0]
		self.assertEqual(response.status_code, 200)
		self.assertEqual((response.context['applications'] >= 0), True)

		
class LogInfoDbTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		app = Application.objects.get_or_create(name = 'test app')[0]
		step = Step.objects.get_or_create(application = app, order = 1)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		student = Student.objects.get_or_create(teacher=teacher,group=group,student_id = 'test student')[0]
		



	def test_log_info_db_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  # we need to make load() work, or the cookie isworthless
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014, 'group':'test group', 'student': 'test student'})
		session.save()

		response = c.post(reverse('log_info_db'), {'time': 20, 'step': 1, 'direction' : 'next', 'example_name':'test app'})
		self.assertEqual(response.status_code, 200)

	def test_log_info_db_invalid_data(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  # we need to make load() work, or the cookie isworthless
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'group' : 'test group', 'year':2014})
		session.save()

		response = c.post(reverse('log_info_db'), {'time': 20, 'step': 1, 'direction' : 'back', 'example_name':'invalid app'})
		self.assertEqual(response.status_code, 200)

		
	def test_log_info_db_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  # we need to make load() work, or the cookie isworthless
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()

		response = c.post(reverse('log_info_db'), {'invalid key': 20, 'step': 1, 'direction' : 'next', 'example_name':'test app'})
		self.assertEqual(response.status_code, 200)
		
		
class LogQuestionInfoDbTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		app = Application.objects.get_or_create(name = 'test app')[0]
		step = Step.objects.get_or_create(application = app, order = 1)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		student = Student.objects.get_or_create(teacher=teacher,group=group,student_id = 'test student')[0]
		question = Question.objects.get_or_create(application = app, step = step, question_text = 'test question')[0]
		option = Option.objects.get_or_create(question = question, number = 1, content = 'test option')[0]

	def test_log_question_info_db_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  # we need to make load() work, or the cookie isworthless
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014, 'group':'test group', 'student': 'test student'})
		session.save()

		response = c.post(reverse('log_question_info_db'), {'time': 20, 'step': 1, 'direction' : 'next', 'example_name':'test app','answer':'test option','multiple_choice':'true'})
		self.assertEqual(response.status_code, 200)

	def test_log_question_info_db_invalid_data(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'group' : 'test group', 'year':2014})
		session.save()

		response = c.post(reverse('log_question_info_db'), {'time': 20, 'step': 1, 'direction' : 'next', 'example_name':'invalid app','answer':'test option','multiple_choice':'true'})
		self.assertEqual(response.status_code, 200)
		
	def test_log_question_info_db_invalid_option(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'group' : 'test group', 'year':2014})
		session.save()

		response = c.post(reverse('log_question_info_db'), {'time': 20, 'step': 1, 'direction' : 'next', 'example_name':'test app','answer':'invalid option','multiple_choice':'true'})
		self.assertEqual(response.status_code, 200)
		
	def test_log_question_info_db_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  # we need to make load() work, or the cookie isworthless
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()

		response = c.post(reverse('log_question_info_db'), {'invalid key': 20, 'step': 1, 'direction' : 'next', 'example_name':'test app','answer':'test option','multiple_choice':'true'})
		self.assertEqual(response.status_code, 200)
		
		
		
class StudentGroupListTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		

	def test_student_group_list_valid(self):
		c = Client()
		response = c.get(reverse('student_group_list'), {'teacher': 'test user', 'year':2014, 'group':'test group'})
		self.assertEqual(response.status_code, 200)
		
	def test_student_group_list_invalid_data(self):
		c = Client()
		response = c.get(reverse('student_group_list'), {'teacher': 'invalid user', 'year':2014, 'group':'test group'})
		self.assertEqual(response.status_code, 200)
		
	def test_student_group_list_invalid_key(self):
		c = Client()
		response = c.get(reverse('student_group_list'), {'invalid': 'test user', 'year':2014, 'group':'test group'})
		self.assertEqual(response.status_code, 200)
		
class CreateGroupTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		

	def test_create_group_valid(self):
		c = Client()
		response = c.post(reverse('create_group'), {'teacher': 'test user', 'year':2014, 'group':'new group','num_students':10})
		self.assertEqual(response.status_code, 200)

	def test_create_group_invalid_data(self):
		c = Client()
		response = c.post(reverse('create_group'), {'teacher': 'invalid user', 'year':2014, 'group':'test group','num_students':10})
		self.assertEqual(response.status_code, 200)
		

	def test_create_group_invalid_key(self):
		c = Client()
		response = c.post(reverse('create_group'), {'invalid keys': 'test user', 'year':2014, 'group':'test group','num_students':10})
		self.assertEqual(response.status_code, 200)

class DeleteGroupTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		

	def test_delete_group_valid(self):
		c = Client()
		response = c.post(reverse('delete_group'), {'teacher': 'test user', 'year':2014, 'group':'test group'})
		self.assertEqual(response.status_code, 200)

	def test_delete_group_invalid_data(self):
		c = Client()
		response = c.post(reverse('delete_group'), {'teacher': 'invalid user', 'year':2014, 'group':'test group'})
		self.assertEqual(response.status_code, 200)
		

	def test_delete_group_invalid_key(self):
		c = Client()
		response = c.post(reverse('delete_group'), {'invalid keys': 'test user', 'year':2014, 'group':'test group'})
		self.assertEqual(response.status_code, 200)


class UpdateGroupTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		

	def test_update_group_valid(self):
		c = Client()
		response = c.post(reverse('update_group'), {'teacher': 'test user', 'year':2014, 'group':'test group','num_students':10})
		self.assertEqual(response.status_code, 200)

	def test_update_group_invalid_data(self):
		c = Client()
		response = c.post(reverse('update_group'), {'teacher': 'invalid user', 'year':2014, 'group':'test group','num_students':10})
		self.assertEqual(response.status_code, 200)
		

	def test_update_group_invalid_key(self):
		c = Client()
		response = c.post(reverse('update_group'), {'invalid keys': 'test user', 'year':2014, 'group':'test group','num_students':10})
		self.assertEqual(response.status_code, 200)
		
		
class RegisterGroupWithSessionTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		

	def test_register_group_with_session_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014})
		session.save()
		response = c.post(reverse('register_group_with_session'), {'group' : 'test group'})
		self.assertEqual(response.status_code, 200)

	def test_register_group_with_session_invalid_data(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014})
		session.save()
		response = c.post(reverse('register_group_with_session'), {'group' : 'invalid group'})
		self.assertEqual(response.status_code, 200)
		

	def test_register_group_with_session_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014})
		session.save()
		response = c.post(reverse('register_group_with_session'), {'invalid key' : 'test group'})
		self.assertEqual(response.status_code, 200)
		
class SaveSessionIdsTests(TestCase):
	def test_save_session(self):
		c = Client()
		response = c.post(reverse('save_session_ids'), {})
		self.assertEqual(response.status_code, 302)
		
		
class RegisterTeacherWithSessionTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]



	def test_register_teacher_with_session_valid(self):
		c = Client()
		response = c.post(reverse('register_teacher_with_session'), {'teacher' : 'test user'})
		self.assertEqual(response.status_code, 200)

	def test_register_teacher_with_session_invalid_data(self):
		c = Client()
		response = c.post(reverse('register_teacher_with_session'), {'teacher' : 'invalid teacher'})
		self.assertEqual(response.status_code, 200)
		

	def test_register_teacher_with_session_invalid_key(self):
		c = Client()
		response = c.post(reverse('register_teacher_with_session'), {'invalid key' : 'test user'})
		self.assertEqual(response.status_code, 200)
		
class RegisterStudentWithSessionTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		student = Student.objects.get_or_create(teacher = teacher, group = group, student_id = 'test student')[0]

	def test_register_student_with_session_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014,'group':'test group'})
		session.save()
		response = c.post(reverse('register_student_with_session'), {'student' : 'test student'})
		self.assertEqual(response.status_code, 200)

	def test_register_student_with_session_invalid_data(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year':2014,'group':'test group'})
		session.save()
		response = c.post(reverse('register_student_with_session'), {'student' : 'invalid student'})
		self.assertEqual(response.status_code, 200)
		

	def test_register_student_with_session_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test teacher','year':2014,'group':'test group'})
		session.save()
		response = c.post(reverse('register_student_with_session'), {'invalid key' : 'test student'})
		self.assertEqual(response.status_code, 200)

class GetGroupsForYearTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		

	def test_get_groups_for_year_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()
		response = c.post(reverse('get_groups_for_year'), {'year' : 2014})
		self.assertEqual(response.status_code, 200)

	def test_get_groups_for_year_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()
		response = c.post(reverse('get_groups_for_year'), {'invalid key' : 2014})
		self.assertEqual(response.status_code, 200)

	def test_get_groups_for_year_invalid_teacher(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'invalid user'})
		session.save()
		response = c.post(reverse('get_groups_for_year'), {'year' : 2014})
		self.assertEqual(response.status_code, 200)
		
		
	def test_get_groups_for_year_invalid_year(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()
		response = c.post(reverse('get_groups_for_year'), {'year' : 2015})
		self.assertEqual(response.status_code, 200)
		
class RegisterYearWithSessionTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		

	def test_register_year_with_session_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()
		response = c.post(reverse('register_year_with_session'), {'year' : 2014})
		self.assertEqual(response.status_code, 200)	
	
	def test_register_year_with_session_invalid_year(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()
		response = c.post(reverse('register_year_with_session'), {'year' : 2015})
		self.assertEqual(response.status_code, 200)

	def test_register_year_with_session_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user'})
		session.save()
		response = c.post(reverse('register_year_with_session'), {'invalid key' : 2014})
		self.assertEqual(response.status_code, 200)
		
class ResetSessionTests(TestCase):
		

	def test_reset_session_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'teacher': 'test user', 'year' : 2014, 'group' : 'test group', 'student': 'test student', 'student_registered': True})
		session.save()
		response = c.post(reverse('reset_session'), {})
		self.assertEqual(response.status_code, 302)
		
class DelSessionVariableTests(TestCase):
		

	def test_del_session_variable_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'delete me': 'delete me'})
		session.save()
		response = c.post(reverse('del_session_variable'), {'to_delete': 'delete me'})
		self.assertEqual(response.status_code, 302)	
		
		
	def test_del_session_variable_invalid_key(self):
		c = Client()
		c.login(username='test user',password='password')
		engine = import_module(settings.SESSION_ENGINE)
		store = engine.SessionStore()
		store.save()  
		c.cookies[settings.SESSION_COOKIE_NAME] = store.session_key
		session = c.session
		session.update({'to_delete': 'delete me'})
		session.save()
		response = c.post(reverse('del_session_variable'), {'bad key': 'delete me'})
		self.assertEqual(response.status_code, 302)	

		
class GetStudentsTests(TestCase):
	
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]

	def test_get_students_valid(self):
		c = Client()
		c.login(username='test user',password='password')
		response = c.get(reverse('get_students'), {'group' : 'test group', 'year' : 2014})
		self.assertEqual(response.status_code, 200)	
		
	def test_get_students_invalid(self):
		c = Client()
		response = c.get(reverse('get_students'), {'wrong key' : 'test group', 'year' : 2014})
		self.assertEqual(response.status_code, 200)
	def test_get_students_invalid_year(self):
		c = Client()
		c.login(username='test user',password='password')
		response = c.get(reverse('get_students'), {'group' : 'test group', 'year' : 2015})
		self.assertEqual(response.status_code, 200)	


class GetQuestionDataTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='test user',
			password='password'
		)
		self.c = Client()
		teacher = Teacher.objects.get_or_create(user = user)[0]
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		student = Student.objects.get_or_create(teacher = teacher, group = group, student_id = 'test student')[0]
		application = Application.objects.get_or_create(name = 'test application')[0]
		step = Step.objects.get_or_create(application = application, order = 1)[0]
		question = Question.objects.get_or_create(application = application, step = step, question_text = 'test question')[0]
		

	def test_get_question_data_missing_key(self):
		print "here222"
		self.c.login(username='test user',password='password')
		response = self.c.get(reverse('get_question_data'), {'year' : 2014, 'group' : 'test group', 'step' : 1, 'question' : 'test question', 'student':'test student'})
		print response.content
		self.assertEqual(response.status_code, 200)
		print "there222"
		
		
	def test_get_question_data_invalid(self):
		self.c.login(username='test user',password='password')
		response = self.c.get(reverse('get_question_data'), {'year' : 2014,'app_name' : 'invalid application', 'group' : 'test group', 'step' : 1, 'question' : 'test question', 'student':'test student'})
		self.assertEqual(response.status_code, 200)
		
		
		
class UpdateTimeGraphTests(TestCase):
	def setUp(self):
		# Setup Test User
		user = User.objects.create_user(
			username='user',
			password='password'
		)
		self.c = Client()
		teacher = Teacher.objects.get_or_create(user = user)[0]
		print teacher
		year = AcademicYear.objects.get_or_create(start = 2014)[0]
		group = Group.objects.get_or_create(teacher = teacher, academic_year = year, name = 'test group')[0]
		student = Student.objects.get_or_create(teacher = teacher, group = group, student_id = 'test student')[0]
		application = Application.objects.get_or_create(name = 'test application')[0]
		step = Step.objects.get_or_create(application = application, order = 1)[0]
		question = Question.objects.get_or_create(application = application, step = step, question_text = 'test question')[0]
		

	def test_update_time_graph_valid(self):
		print "here"
		self.c.login(username='test user',password='password')
		
		response = self.c.get(reverse('update_time_graph'), {'year' : 2014,'app_name' : 'test application', 'group' : 'test group', 'student':'test student'})
		self.assertEqual(response.status_code, 200)
		print "there"
		
		
	def test_update_time_graph_invalid(self):
		
		self.c.login(username='test user',password='password')
		response = self.c.get(reverse('update_time_graph'), {'year' : 2014,'app_name' : 'test application', 'group' : 'test group', 'step' : 1, 'question' : 'test question', 'student':'test student'})
		self.assertEqual(response.status_code, 200)
	