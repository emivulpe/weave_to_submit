import os
import xml.etree.ElementTree as ET
import json
import sys



########################## Code to take care for populating the Doc Types ####################

# A method that takes an xml ducument containing information about the doc types and stores it in the database
def populate_doc_types(filepath):

	file = open(filepath,'r')
	tree = ET.parse(file)
	root = tree.getroot()
	for document_type in root: #Get the documentType element
		document_type_attr_dict=document_type.attrib # Get the attributes for the document type
		document_id = document_type_attr_dict['ID'] # Get the id
		document_type_name = document_type_attr_dict['name'] # Get the name
		# Add the document type to the database
		doc_type = add_document_type(document_type_attr_dict)
		if doc_type is not None:
			# Add the fragment types for the document type
			for fragment_type in document_type:
				fragment_type_attr_dict=fragment_type.attrib 
				fragment_type_name = fragment_type_attr_dict['name']
				frag_type = add_fragment_type(doc_type,fragment_type_attr_dict)
				if frag_type is not None:
					# Add the text style for the fragment type
					for text_style in fragment_type:
						text_style_attr_dict = text_style.attrib
						add_fragment_style(doc_type,frag_type,text_style_attr_dict)


# A method to add a fragment style to the database
def add_fragment_style(document_type,fragment_type, text_style_attr_dict):
	font = text_style_attr_dict['font']
	font_size = text_style_attr_dict['size']
	str_to_bool(text_style_attr_dict['bold'])
	bold = str_to_bool(text_style_attr_dict['bold'])
	italic = str_to_bool(text_style_attr_dict['italic'])
	underlined = str_to_bool(text_style_attr_dict['underline'])
	fragment_style = FragmentStyle.objects.get_or_create(font = font,bold = bold, italic = italic, underlined = underlined, font_size = font_size,type=fragment_type)[0]
	return fragment_style

# A method to add a document type to the database
def add_document_type(document_type_attr_dict):
	name = document_type_attr_dict['name']
	kind = document_type_attr_dict['kind']
	document_type = DocumentType.objects.get_or_create(name=name)[0]
	document_type.kind = kind
	document_type.save()
	return document_type

# A method to add a fragment type to the database
def add_fragment_type(document_type,fragment_type_attr_dict):
	name = fragment_type_attr_dict['name']
	kind = fragment_type_attr_dict['kind']
	fragment_type = FragmentType.objects.get_or_create(document_type=document_type,name=name,kind=kind)[0]
	return fragment_type
	
# A method to convert a string to a boolean
def str_to_bool(s):
	if s == 'true':
		 return True
	elif s == 'false':
		 return False
	else:
		 raise ValueError
		 
##############################################################################################



################################### Code to populate the documents ###########################

def populate_documents(filepath):

	file = open(filepath,'r')
	tree = ET.parse(file)
	root = tree.getroot()
	for document in root:
		docAttrDict = document.attrib
		doc = add_document(docAttrDict)
		if doc is not None:
			for fragment in document:
				fragAttrDict = fragment.attrib
				add_fragment(doc,fragAttrDict)

# A method to add a document to the database
def add_document(attributesDict):
	try:
		document_id = attributesDict['ID']
		type = attributesDict['type']
		kind = attributesDict['kind']
		document_type=DocumentType.objects.filter(name=type, kind=kind)[0]
		document_name = attributesDict['name']
		fixOrder = json.loads(attributesDict['FixOrder'])
		d = Document.objects.get_or_create(id = document_id)[0]
		d.name = document_name
		d.document_type = document_type
		d.fixOrder = fixOrder
		d.save()
		return d
	except (IntegrityError, IndexError, KeyError):
		return None

# A method to add a fragment to the database
def add_fragment(doc, attributesDict):
	try:
		type = attributesDict['type']
		document_type=doc.document_type
		fragment_type=FragmentType.objects.filter(name=type,document_type=document_type)[0]
		fragment_style=FragmentStyle.objects.filter(type=fragment_type)[0]
		id = attributesDict['ID']
		text = attributesDict['value']
		text = text.replace(' ','&nbsp')
		text = text.replace('<','&lt')
		text = text.replace('>','&gt')
		if text.endswith(';'):
			text = text[:text.rfind(";"):] + "<br/>"
		order = json.loads(attributesDict['order'])
		f = Fragment.objects.get_or_create(id = id,document = doc, style = fragment_style, type = fragment_type, text = text, order = order)[0]

	except (IntegrityError, IndexError, KeyError):
		pass

##############################################################################################

############################### Code to populate the applications ############################

def populate_applications(filepath):

	file = open(filepath,'r')
	tree = ET.parse(file)
	root = tree.getroot()
	for application in root:
		add_application(application)

# A method to add an example to the database
def add_application(app):
	try:
		applicationAttributesDict = app.attrib
		name = applicationAttributesDict['name']
		#layout = applicationAttributesDict['layout']
		application = Application.objects.get_or_create(name = name)[0]
		#application.layout = layout
		application.save()
		if len(Panel.objects.filter(application = application)) == 0:
			for panel in app.iter('panel'):
				panelAttributesDict = panel.attrib
				add_panel(application,panelAttributesDict)
	except (IntegrityError, KeyError):
		pass

# A method to add a panel to the database
def add_panel(application, attributesDict):
	try:
		number = json.loads(attributesDict['number'])
		type = attributesDict['type']
		documentName = attributesDict['content']
		document = Document.objects.filter(name = documentName)
		if len(document) > 0:
			document = document[0]
			p = Panel.objects.get_or_create(application = application, number = number, type = type, document = document)[0]
	except (IntegrityError, ObjectDoesNotExist, KeyError):
		pass

##############################################################################################

################################### Code to populate the processes ###########################

def populate_processes(filepath):

	file = open(filepath,'r')
	tree = ET.parse(file)
	root = tree.getroot()
	for process in root:
		processAttrDict = process.attrib
		app_name = processAttrDict['app']
		application = Application.objects.filter(name = app_name)
		if len(application) > 0:
			application = application[0]
			for step in process:
				stepAttrDict = step.attrib
				s = add_step(application, stepAttrDict)
				if s is not None:
					for element in step: 
						if element.tag == 'change':
							add_change(application,s,element)
						elif element.tag == 'explanation':
							add_explanation(s,element)



# A method to add a step to the database
def add_step(application, attributesDict):
	try:
		order = attributesDict['num']
	except KeyError:
		return None
	try:
		s = Step.objects.get_or_create(application=application, order = order)[0]
		return s
	except (IntegrityError, ObjectDoesNotExist):
		return None

# A method to add a change to the database
def add_change(application, step, element):
	fragment = None
	operation = ''
	document = ''
	try:
		for child in element:
			if child.tag == 'fragname':
				fragmentId = child.attrib['id']
				fragment = Fragment.objects.get(id = fragmentId)
			elif child.tag == 'operation':
				operation = child.text
			elif child.tag == 'docname':
				documentName = child.text
				document = Document.objects.get(name = documentName)
			elif child.tag == 'question':
				question_text = child.attrib['content']
				question_text = question_text.replace('<','&lt')
				question_text = question_text.replace('>','&gt')
				question = Question.objects.get_or_create(application=application, step = step, question_text = question_text)[0]
				for option in child:
					optionAttributesList = option.attrib
					number = json.loads(optionAttributesList['num'])
					content = optionAttributesList['content']
					content = content.replace('<','&lt')
					content = content.replace('>','&gt')
					o = Option.objects.get_or_create(question = question, number = number, content = content)[0]
		if operation != 'Ask Answer':
			c = Change.objects.get_or_create(document = document, step = step, fragment = fragment, operation = operation)[0]
		else:
			c = Change.objects.get_or_create(document = document, step = step, question = question, operation = operation)[0]
	except (IntegrityError, ObjectDoesNotExist, KeyError):
		pass
		

# A method to add an explanation to the database
def add_explanation(step, element):
	text = element.text
	text = text.replace('\n','<br>').replace('\r', '<br>');
	try:
		e = Explanation.objects.get_or_create(step = step, text = text)[0]
	except:
		pass


############################################################################################


if __name__ == '__main__':
	print "Starting DocumentFragment population script..."
	
	os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exercises_system_project.settings')
	from exerciser.models import FragmentStyle, Document, DocumentType, FragmentType, Fragment, Step, Change, Question, Explanation, Option, Application, Panel, AcademicYear
	from django.db import IntegrityError
	from django.core.exceptions import ObjectDoesNotExist
	
	
	# If the path to the examples is specified as a command line argument, take it, else assume the examples are placed in the examples folder
	if len(sys.argv) > 1:
		path = sys.argv[1]
	else:
		path = os.path.join(os.path.dirname(__file__), 'examples/')
	
	doc_types_path = os.path.join(path, 'Doc Types.xml')
	populate_doc_types(doc_types_path)
	
	documents_path = os.path.join(path, 'Documents.xml')
	populate_documents(documents_path)

	applications_path = os.path.join(path, 'Applications.xml')
	populate_applications(applications_path)
	
	processes_path = os.path.join(path, 'Processes.xml')
	populate_processes(processes_path)
	
	#Add an academic year
	academic_year = AcademicYear.objects.get_or_create(start = 2014)[0]

