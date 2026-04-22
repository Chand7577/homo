import os
from pathlib import Path
from dotenv import load_dotenv
import cloudinary
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-homeopathy-change-in-production")

DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")


SITE_URL = "http://localhost:8000"


ADMIN_CREDENTIALS = {
    'admin1': {
        'email': os.environ.get('ADMIN1_EMAIL', 'amritchand0713@gmail.com'),
        'password': os.environ.get('ADMIN1_PASSWORD', 'Admin@123'),
        'name': 'System Administrator'
    },
    'admin2': {
        'email': os.environ.get('ADMIN2_EMAIL', 'superadmin@homeopathy.com'),
        'password': os.environ.get('ADMIN2_PASSWORD', 'SuperAdmin@123'),
        'name': 'Super Administrator'
    }
}


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "homeopathy",  
    "django.contrib.humanize",
    "cloudinary",
    "cloudinary_storage",
]



AUTH_USER_MODEL = "homeopathy.CustomUser"


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "myproject.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "myproject.wsgi.application"


# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": "homeopathy_uh1b",
#         "USER": "homeopathy_uh1b_user",
#         "PASSWORD": "qZmp4afP1vzEobDli2sPBWh7aqnWpisR",
#         "HOST": "dpg-d64q0q1r0fns73ccq7eg-a.oregon-postgres.render.com",
#         "PORT": "5432",
#         "CONN_MAX_AGE": 0,
#         "OPTIONS": {
#             "sslmode": "require",
#         },
#     }
# }



### mera code idhar hain
DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://postgres:1234@127.0.0.1:5432/homo',
        conn_max_age=600
    )
}

# If running locally (not on Render) and in DEBUG mode, ensure we use the local DB
# even if DATABASE_URL is set in .env (which often contains Render production URLs)
if not os.environ.get('RENDER') and DEBUG:
    host = DATABASES['default'].get('HOST', '')
    # Check if host looks like a Render internal hostname
    if host and ('-a' in host or 'render.com' in host):
        DATABASES['default'] = dj_database_url.parse('postgresql://postgres:1234@127.0.0.1:5432/homo')
        DATABASES['default']['CONN_MAX_AGE'] = 600


























# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": "homeopathy_uh1b",
#         "USER": "homeopathy_uh1b_user",
#         "PASSWORD": "qZmp4afP1vzEobDli2sPBWh7aqnWpisR",
#         "HOST": "dpg-d64q0q1r0fns73ccq7eg-a.oregon-postgres.render.com",
#         "PORT": "5432",
#         "CONN_MAX_AGE": 60,
#         "OPTIONS": {
#             "sslmode": "require",
#         },
#     }
# }



AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', ''),  
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', ''),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', ''),
}

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"


CORS_ALLOW_ALL_ORIGINS = True

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://localhost:8001",
#     "http://127.0.0.1:8001",
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "https://homeopathy-three.vercel.app",
#     "https://homofrontend.vercel.app",
# ]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://homeopathy-three.vercel.app",
    "https://homofrontend.vercel.app",
    "https://*.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'pragma',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]


CORS_PREFLIGHT_MAX_AGE = 86400


CORS_ALLOW_ALL_HEADERS = True


# SESSION_ENGINE = 'django.contrib.sessions.backends.db'  
SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
SESSION_COOKIE_NAME = "sessionid"
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7  # 7 days
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "None"  
SESSION_COOKIE_SECURE = True  
CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_DOMAIN = None  


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 100,
}


# ✅ Gmail SMTP Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', '')
# DEFAULT_FROM_EMAIL = 'AnkitKumar#123Prajapti#123'     # 👈 Same as EMAIL_HOST_USER


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'homeopathy': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

os.makedirs(BASE_DIR / 'logs', exist_ok=True)


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

# (Gmail SMTP configured above — no SendGrid needed)
