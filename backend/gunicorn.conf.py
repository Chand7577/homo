import os
import multiprocessing

# Gunicorn configuration file for production / Render
# Designed to be extremely memory-efficient for 512MB RAM containers

# 1. Worker and Thread Configuration
# In resource-limited environments, we use 1 worker process to minimize RAM overhead.
# To handle concurrent requests, we use lightweight threads (which share the same process RAM).
workers = 1
threads = 4
worker_class = 'gthread'

# 2. Timeout and Keep-Alive
# Render containers are heavily throttled on startup, causing cold boots to exceed the default 30s.
# We increase the timeout to 120s to allow ample startup time.
timeout = 120
keepalive = 5

# 3. Bind
# Bind to the PORT environment variable provided by Render, defaulting to 8000
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"

# 4. Logging
# Ensure logs are forwarded to stdout/stderr so Render can capture them
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 5. Resource Tuning
# Limit the max requests a worker can handle before gracefully restarting.
# This prevents memory leaks from accumulating and crashing the container.
max_requests = 1000
max_requests_jitter = 50
