# import os

# # Put your actual API key here temporarily for testing
# # It's best practice to use environment variables in production code
# API_KEY = "AIzaSyBE-iXPzZdYBhMquXVb1q-3gVKP7J3oxRc" 

# try:
#     # Try the new import style
#     from google import genai 
# except ImportError:
#     # Fallback to the legacy import style
#     import google.generativeai as genai

# def verify_gemini_api_key(key):
#     """Attempts to list models to verify the API key is working."""
#     if not key:
#         print("API Key is missing from the script.")
#         return False

#     try:
#         # Pass the key directly to the client constructor
#         client = genai.Client(api_key=key) 
        
#         # Attempt to list models. A successful response means the key is valid.
#         models = client.models.list()
#         print("API Key is working! Successfully listed models:")
#         for model in models:
#             print(f"- {model.name}")
#         return True

#     except Exception as e:
#         print(f"API Key verification failed. Error: {e}")
#         return False

# if __name__ == "__main__":
#     verify_gemini_api_key(API_KEY)

from sentence_transformers import SentenceTransformer
    