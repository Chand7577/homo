import os
import json
import requests
from django.conf import settings
from google.oauth2 import service_account
import google.auth.transport.requests
from .models import FCMToken


def send_latest_feed_notification():
    """Fetch latest feed and send notifications to all registered FCM tokens."""

    # 1️⃣ Fetch the latest feed
    feed_api = "https://cyberpedia-api-d7x0.onrender.com/notifications/feeds/latest"
    try:
        res = requests.get(feed_api, timeout=10)
    except Exception as e:
        print(f"❌ Error fetching feed: {e}")
        return

    if res.status_code != 200:
        print("❌ Failed to fetch latest feed:", res.status_code)
        return

    feed = res.json()
    print("✅ Latest feed fetched:", feed.get("title", "No Title"))

    # 2️⃣ Load Firebase credentials from environment
    if not settings.FIREBASE_CREDENTIALS:
        print("⚠️ FIREBASE_CREDENTIALS not found in settings.")
        return

    SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']

    try:
        credentials = service_account.Credentials.from_service_account_info(
            settings.FIREBASE_CREDENTIALS,
            scopes=SCOPES
        )
        request = google.auth.transport.requests.Request()
        credentials.refresh(request)
        access_token = credentials.token
    except Exception as e:
        print("❌ Error initializing Firebase credentials:", e)
        return

    # 3️⃣ Firebase project ID
    project_id = settings.FIREBASE_CREDENTIALS.get("project_id", "cyberpediawithflutter")

    # 4️⃣ Firebase Cloud Messaging endpoint
    url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; UTF-8",
    }

    # 5️⃣ Retrieve FCM tokens
    tokens = list(FCMToken.objects.values_list('token', flat=True))
    if not tokens:
        print("⚠️ No FCM tokens found in the database.")
        return

    print(f"📦 Sending notification to {len(tokens)} devices...")

    # 6️⃣ Send notification to each token
    for target_token in tokens:
        body = {
            "message": {
                "token": target_token,
                "notification": {
                    "title": feed.get("title", "Cyberpedia Feed Update"),
                    "body": (feed.get("content_snippet") or "")[:200] + "...",
                    "image": feed.get("image", "")
                },
                "android": {
                    "priority": "high",
                    "notification": {
                        "sound": "notification",
                        "channel_id": "high_importance_channel"
                    }
                },
                "apns": {
                    "payload": {"aps": {"sound": "notification.mp3"}}
                },
                "data": {
                    "route": feed.get("screen", "cyber_feeds"),
                    "feed_id": str(feed.get("id", "")),
                },
            }
        }

        try:
            response = requests.post(url, headers=headers, data=json.dumps(body), timeout=10)
            print(f"🔔 Sent to {target_token[:8]}... | Status: {response.status_code}")
            if response.status_code != 200:
                print("⚠️ Response:", response.text)
        except Exception as e:
            print(f"❌ Error sending to token {target_token[:8]}...: {e}")

    print("✅ Notification broadcast complete!")
