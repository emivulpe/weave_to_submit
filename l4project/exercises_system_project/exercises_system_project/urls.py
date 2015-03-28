from django.conf.urls import patterns, include, url
from django.conf import settings

# Enable the admin
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    # Enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

# This is the version of the urls for the deployed project
if True:
    urlpatterns = patterns('',

        url(r'^admin/', include(admin.site.urls)),
        url(r'^weave/', include('exerciser.urls'))
    )
	
# This is the version of the urls for the debugging local version
else:
    urlpatterns = patterns('',

        url(r'^admin/', include(admin.site.urls)),
        url(r'^', include('exerciser.urls'))
    )

# A url to the media folder
if settings.DEBUG:
    urlpatterns += patterns(
        'django.views.static',
        (r'media/(?P<path>.*)',
        'serve',
        {'document_root': settings.MEDIA_ROOT}), )
