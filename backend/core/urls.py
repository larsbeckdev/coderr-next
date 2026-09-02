"""Central routing for the Coderr backend."""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('auth_app.api.urls')),
    path('api/', include('offers_app.api.urls')),
    path('api/', include('orders_app.api.urls')),
    path('api/', include('reviews_app.api.urls')),
    path('api/', include('base_info_app.api.urls')),
]

# ponytail: Django serves uploads itself instead of putting a web server in
# front. django.conf.urls.static.static() only does this while DEBUG is on,
# and the container runs with DEBUG off, so profile pictures and offer images
# would 404 there. Move /media/ to a reverse proxy once traffic justifies it.
urlpatterns += [
    re_path(
        r'^media/(?P<path>.*)$',
        serve,
        {'document_root': settings.MEDIA_ROOT},
    ),
]
