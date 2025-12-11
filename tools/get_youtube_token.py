import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def main():
    """Shows basic usage of the People API.
    Prints the name of the first 10 connections.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
            
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # You need to download your OAuth 2.0 Client ID JSON from Google Cloud Console
            # and save it as 'client_secret.json' in this directory.
            if not os.path.exists('client_secret.json'):
                print("Error: 'client_secret.json' not found.")
                print("1. Go to Google Cloud Console > APIs & Services > Credentials")
                print("2. Create OAuth Client ID (Desktop App)")
                print("3. Download JSON and rename to 'client_secret.json'")
                return

            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
            print("Token saved to 'token.pickle'.")
            
        print("\n=== IMPORTANT FOR GITHUB ACTIONS ===")
        print(f"Refresh Token: {creds.refresh_token}")
        print("Save this as YOUTUBE_REFRESH_TOKEN in GitHub Secrets.")
        print(f"Client ID: {creds.client_id}")
        print(f"Client Secret: {creds.client_secret}")

if __name__ == '__main__':
    main()
