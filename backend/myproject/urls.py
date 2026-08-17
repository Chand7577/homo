from django.contrib import admin
from django.urls import path, include
from homeopathy.views import HomeView
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('test-cors/', lambda r: JsonResponse({'status': 'ok', 'message': 'CORS is working!'})),
    path('homeopathy/', include('homeopathy.urls')),
    path('', HomeView.as_view(), name='home'),
]

    