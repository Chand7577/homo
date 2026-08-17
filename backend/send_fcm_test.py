import requests
import json
from google.oauth2 import service_account
import google.auth.transport.requests

def send_latest_feed_notification():
    # 1️⃣ Fetch the latest feed from your API
    feed_api = "https://cyberpedia-api-d7x0.onrender.com/notifications/feeds/latest"
    res = requests.get(feed_api)

    if res.status_code != 200:
        print("❌ Failed to fetch latest feed:", res.status_code)
        return

    feed = res.json()
    print("✅ Latest feed fetched:", feed.get("title", "No Title"))

    # 2️⃣ Load Firebase credentials
    SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']
    SERVICE_ACCOUNT_FILE = 'firebase_key.json'

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    access_token = credentials.token

    # 3️⃣ Firebase project ID
    project_id = "cyberpediawithflutter"

    # 4️⃣ Target FCM token
    target_token = "f3d6NYNaRfiVRWfmSG9Vv6:APA91bFSciWyrsHtbq1O-Sm2mRvDrazYmhNodOG5UAYN2dgWSi4LfkGwd9sHXy06ZiN7WFYNKuAbBEN_SEWb-AxoNaOYE6FMZk2WlRZnXrPJwfUN_mCQMB0"

    # 5️⃣ FCM endpoint
    url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; UTF-8",
    }

    # 6️⃣ Build payload with corrected Android block
    body = {
        "message": {
            "token": target_token,
            "notification": {
                "title": feed.get("title", "Cyberpedia Feed Update"),
                "body": (feed.get("content_snippet") or "")[:200] + "...",
                "image": feed.get("image", "")
            },
            "android": {
                "priority": "high",  # ✅ moved here
                "notification": {
                    "sound": "notification",  # must match your raw/ file
                    "channel_id": "high_importance_channel"
                }
            },
            "apns": {
                "payload": {
                    "aps": {
                        "sound": "notification.wav"
                    }
                }
            },
            "data": {
                "route": feed.get("screen", "cyber_feeds"),
                "feed_id": str(feed.get("id", ""))
            }
        }
    }

    # 7️⃣ Send request
    response = requests.post(url, headers=headers, data=json.dumps(body))
    print("🔔 Status:", response.status_code)
    print("🔔 Response:", response.text)


if __name__ == "__main__":
    send_latest_feed_notification()
