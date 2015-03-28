from django.db import models
from django.contrib.auth.models import User


# A class for applications
class Application(models.Model):
	name = models.CharField(max_length = 128, primary_key = True)

	# Show it via application name
	def __unicode__(self):
		return self.name

# A class for document types
class DocumentType(models.Model):
	name = models.CharField(max_length=128,unique=True,primary_key=True)
	kind = models.CharField(max_length=128)
	
	# Show it via document type name
	def __unicode__(self):
		return self.name

# A class for fragment types
class FragmentType(models.Model):
	name = models.CharField(max_length=128)
	kind = models.CharField(max_length=128)
	document_type = models.ForeignKey(DocumentType, blank=True, null=True, unique = False)
	
	# Show it via fragment type name
	def __unicode__(self):
		return self.name

# A class for fragment styles
class FragmentStyle(models.Model):
	font = models.CharField(max_length=50)
	bold = models.BooleanField(default=False)
	italic = models.BooleanField(default=False)
	underlined = models.BooleanField(default=False)
	font_size = models.SmallIntegerField(default=12)
	type = models.ForeignKey(FragmentType, blank=True, null=True, unique = False)
	
	# Prepare the fragment style in the form of css attributes
	def __unicode__(self):
		style=""
		if self.font != None:
			style += "font-family: "+self.font + ";"
		if self.bold != None and self.bold:
			style += "font-weight: bold;"
		if self.italic != None and self.italic:
			style += "font-style: italic;"
		if self.underlined != None and self.underlined:
			style += "text-decoration: underline;"
		if self.font_size != None:
			style += "font-size: " + str(self.font_size) + "px;"
		return style
		
# A class for documents
class Document(models.Model):
	id = models.CharField(max_length=128,unique=True,primary_key=True)
	document_type = models.ForeignKey(DocumentType, blank=True, null=True)
	name = models.CharField(max_length=128)
	
	# Show if via the document name
	def __unicode__(self):
		return self.name

# A class for fragments
class Fragment(models.Model):
	id = models.CharField(max_length=128,unique=True,primary_key=True)
	document = models.ForeignKey(Document, blank=True, null=True)
	style = models.ForeignKey(FragmentStyle, blank=True, null=True)
	text = models.TextField()
	type = models.ForeignKey(FragmentType, blank=True, null=True)
	order = models.IntegerField()

	# Show it via the text for the fragment
	def __unicode__(self):
		return self.text
	
# A class for the steps
class Step(models.Model):
	application = models.ForeignKey(Application, unique = False)
	order = models.IntegerField()

	def __unicode__(self):
		return str(self.order)

	class Meta:
		ordering = ['order']
		
# A class for the questions
class Question(models.Model):
	application = models.ForeignKey(Application, unique = False)
	step = models.ForeignKey(Step)
	question_text = models.TextField()

	def __unicode__(self):
		return self.question_text

	def __repr__(self):
		return self.__unicode__()
		
# A class for the changes at each step
class Change(models.Model):
	step = models.ForeignKey(Step, unique = False)
	fragment = models.ForeignKey(Fragment, blank=True, null=True, unique = False)
	question = models.ForeignKey(Question, blank=True, null=True, unique = False)
	document = models.ForeignKey(Document, unique = False)
	operation = models.CharField(max_length=128)

	def getChanges(self):
		if self.operation == 'Insert':
			return [[self.fragment.id, 'show']]
		elif self.operation == 'Highlight':
			return [[self.fragment.id, 'highlight']] #change later
		elif self.operation == 'Unhighlight':
			return [[self.fragment.id, 'unhighlight']]
		elif self.operation == 'Show all':
			result = []
			fragments = Fragment.objects.filter (document = self.document)
			for fragment in fragments:
				result.append([fragment.id, 'showall'])
			return result
		elif self.operation == 'Ask Answer':
			question_text = self.question.question_text
			options = Option.objects.filter(question = self.question)
			option_list = []
			for option in options:
				option_list.append(option.content)
			return [[question_text, 'question', option_list]]
		else:
			return [[self.fragment.id, 'hide']]#default behaviour
		
	def __unicode__(self):
		return " ".join(("Document: ", self.document.name," | Step: ", str(self.step.order), " | Text: ",self.fragment.text, " | Operation:", self.operation ))

# A class for the explanations at the steps
class Explanation(models.Model):
	step = models.ForeignKey(Step, unique = False)
	text = models.TextField()

	def __unicode__(self):
		return self.text
		
		
# A class for the options to questions
class Option(models.Model):
	question = models.ForeignKey(Question, unique = False)
	number = models.IntegerField()
	content = models.CharField(max_length = 256)


	def __unicode__(self):
		return "".join(("Option: ", str(self.number), ". ", self.content))


# A class for the panels storing the documents for the examples
class Panel(models.Model):
	application = models.ForeignKey(Application, unique = False)
	document = models.ForeignKey(Document, unique = False)
	type = models.CharField(max_length = 128)
	number = models.IntegerField()
	
	def __init__(self, *args, **kwargs):
		super(Panel, self).__init__(*args, **kwargs)
		self.fragment_operation_mapping = self.initialise_fragment_operation_mappings()
		
		
	def __unicode__(self):
		return " ".join((str(self.number) ,self.application.name))
		
	def initialise_fragment_operation_mappings(self):
		mappings = []
		for fragment in Fragment.objects.filter(document = self.document):
			index = fragment.order
			mappings.insert(index,{fragment.text : 'show'}) 
		return mappings
	def getFragments(self):
		return Fragment.objects.filter(document = self.document)

# A class for the academic years
class AcademicYear(models.Model):
	start = models.IntegerField(primary_key=True)
	
	def __unicode__(self):
		return str(self.start)

# A class for the teachers
class Teacher(models.Model):
	user = models.OneToOneField(User)
	can_analyse = models.BooleanField(default=False)
	
	def __unicode__(self):
		return " ".join((self.user.username ,str(self.can_analyse)))

# A class for the groups
class Group(models.Model):
	teacher = models.ForeignKey(Teacher, unique = False)
	academic_year = models.ForeignKey(AcademicYear, unique = False)
	name = models.CharField(max_length=100)
	class Meta:
		unique_together = ('academic_year', 'name','teacher')
	def __unicode__(self):
		return self.name
	def __repr__(self):
		return self.__unicode__()

# A class for the students
class Student(models.Model):
	teacher = models.ForeignKey(Teacher, unique = False)
	group = models.ForeignKey(Group, unique = False)
	student_id = models.CharField(max_length=2)

	def __unicode__(self):
		return self.student_id
	def __repr__(self):
		return self.__unicode__()
		
# A class for a usage data of a step
class UsageRecord(models.Model):
	application = models.ForeignKey(Application, unique = False)
	teacher = models.ForeignKey(Teacher, blank=True, null=True, unique = False)
	group = models.ForeignKey(Group, blank=True, null=True, unique = False)
	student = models.ForeignKey(Student, blank=True, null=True, unique = False)
	step = models.ForeignKey(Step, unique = False)
	session_id = models.CharField(max_length=100, blank=True, null=True)
	time_on_step = models.FloatField(default=0)
	direction = models.CharField(max_length=10)
	step_number = models.IntegerField()
	
	def __unicode__(self):
		if self.teacher != None:
			teacher=self.teacher.user.username
		else:
			teacher="No teacher"
		if self.group != None:
			group=self.group.name
		else:
			group="No group"
		if self.student != None:
			student=self.student.student_id
		else:
			student="No student id"
		return " ".join((self.application.name ," teacher: ",teacher," group: ",group," student: ",student, "step", str(self.step.order)))
		

	def save(self, *args, **kwargs):	
		self.step_number = self.step.order
		super(UsageRecord, self).save(*args, **kwargs)

# A class for the usage data of a step with a question
class QuestionRecord(models.Model):
	application = models.ForeignKey(Application, unique = False)
	question = models.ForeignKey(Question, unique = False)
	teacher = models.ForeignKey(Teacher, blank=True, null=True, unique = False)
	group = models.ForeignKey(Group, blank=True, null=True, unique = False)
	student = models.ForeignKey(Student, blank=True, null=True, unique = False)
	session_id = models.CharField(max_length=100, blank=True, null=True)
	answer = models.ForeignKey(Option, blank=True, null=True, unique = False)
	answer_text=models.TextField()
