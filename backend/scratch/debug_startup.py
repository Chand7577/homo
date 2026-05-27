import os
import sys
import time

def print_memory():
    try:
        import psutil
        process = psutil.Process(os.getpid())
        mem = process.memory_info().rss / (1024 * 1024)
        print(f"Memory usage: {mem:.2f} MB")
    except ImportError:
        print("Memory usage: psutil not available (installing psutil is optional)")

print("--- Starting startup simulation ---")
print_memory()

start_time = time.time()

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

print("Importing django...")
import django

print("Calling django.setup()...")
setup_start = time.time()
django.setup()
print_memory()
print(f"django.setup() took {time.time() - setup_start:.2f} seconds")

print("Importing WSGI application...")
wsgi_start = time.time()
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
print_memory()
print(f"get_wsgi_application() took {time.time() - wsgi_start:.2f} seconds")

print(f"Total startup time: {time.time() - start_time:.2f} seconds")
print("--- End startup simulation ---")
