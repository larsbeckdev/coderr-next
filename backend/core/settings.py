"""
Django settings for the Coderr backend project.

Values that differ between machines (secret key, debug flag, allowed hosts,
CORS origins) are read from an optional ``.env.local`` file. Every setting has
a development fallback, so the project runs after a plain ``git clone``.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env.local')


def get_env_list(name, default):
    """Read a comma separated environment variable into a list of strings."""
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


def get_env_bool(name, default):
    """Read a boolean environment variable written as ``True``/``False``."""
    value = os.environ.get(name, default).strip().lower()
    return value in ('1', 'true', 'yes')


SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-n8u=lz0%h@mp^kbc7a$grn#@6=(v33w4&7zwv5dqjmz$m_h4+3',
)

DEBUG = get_env_bool('DJANGO_DEBUG', 'True')

ALLOWED_HOSTS = get_env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')

# Needed once something in front terminates HTTPS: the admin login posts to
# the proxy origin, and Django only accepts it when that origin is trusted
# and the forwarded scheme is believed.
CSRF_TRUSTED_ORIGINS = get_env_list('DJANGO_CSRF_TRUSTED_ORIGINS', '')

if get_env_bool('DJANGO_TRUST_PROXY_SSL_HEADER', 'False'):
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',

    'auth_app',
    'offers_app',
    'orders_app',
    'reviews_app',
    'base_info_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Serves everything collectstatic wrote to STATIC_ROOT. Django itself
    # only serves static files while DEBUG is on, and the container runs
    # gunicorn with DEBUG off, so without this the admin has no CSS.
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# The container keeps the database file on a volume, so DJANGO_DB_PATH
# points it outside of the image. Without the variable it stays next to the
# project, which is what the local development setup uses.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.environ.get('DJANGO_DB_PATH', BASE_DIR / 'db.sqlite3'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.'
                'UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.'
                'MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.'
                'CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.'
                'NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

STATIC_ROOT = os.environ.get('DJANGO_STATIC_ROOT', BASE_DIR / 'staticfiles')

MEDIA_URL = 'media/'

# Uploaded profile pictures and offer images. Like the database this lives on
# a volume in the container so a rebuild does not wipe it.
MEDIA_ROOT = os.environ.get('DJANGO_MEDIA_ROOT', BASE_DIR / 'media')

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'COERCE_DECIMAL_TO_STRING': False,
}

CORS_ALLOWED_ORIGINS = get_env_list(
    'DJANGO_CORS_ALLOWED_ORIGINS',
    'http://localhost:5500,http://127.0.0.1:5500,'
    'http://localhost:5501,http://127.0.0.1:5501',
)

CORS_ALLOW_ALL_ORIGINS = get_env_bool('DJANGO_CORS_ALLOW_ALL_ORIGINS', 'True')
