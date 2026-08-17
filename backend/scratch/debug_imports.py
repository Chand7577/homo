import os
import sys
import time

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

print("=== PROFILING IMPORTS STEP-BY-STEP ===")

t0 = time.time()
import django
print(f"Importing django took: {time.time() - t0:.4f}s")

t0 = time.time()
from django.conf import settings
# Force settings loading
_ = settings.INSTALLED_APPS
print(f"Loading settings took: {time.time() - t0:.4f}s")

# Let's intercept imports to see what gets loaded during apps.populate
import builtins
real_import = builtins.__import__

import_times = {}

def timed_import(name, globals=None, locals=None, fromlist=None, level=0):
    start = time.time()
    res = real_import(name, globals, locals, fromlist, level)
    duration = time.time() - start
    
    # Store top-level module duration
    top_name = name.split('.')[0]
    import_times[top_name] = import_times.get(top_name, 0.0) + duration
    return res

builtins.__import__ = timed_import

print("\nCalling django.setup() (this will populate apps and import models)...")
t0 = time.time()
django.setup()
setup_time = time.time() - t0
print(f"django.setup() completed in: {setup_time:.4f}s")

print("\n--- Top-level import times during django.setup() ---")
sorted_imports = sorted(import_times.items(), key=lambda x: x[1], reverse=True)
for mod_name, dur in sorted_imports[:15]:
    print(f"  {mod_name}: {dur:.4f}s")

print("\n=== PROFILING COMPLETED ===")
