import requests
import json
from config import BASE_URL
import os

def get_company_info(data):
    # URL of the API endpoint
    url = f'{BASE_URL}/get-company?id={data["id"]}'

    # Commented-out part to fetch JWT token from the system
    # with open('/path/to/jwt/token/file', 'r') as f:
    #     jwt_token = f.read().strip()

    # Hardcoded JWT token for testing
    current_directory = os.environ['EXEC_PATH']
    with open(os.path.join(current_directory, '..', 'userData.json')) as f:
        jwt_token = json.load(f)['token']
    
    jwt_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmMzNjU3NGUwNjQ3M2RkZmNlMzI0NzEiLCJmaXJzdF9uYW1lIjoiQW1hbGkiLCJsYXN0X25hbWUiOiJCb29rcyIsImVtYWlsIjoiYW1hbGlib29rc0BuYW1pc3dlYi5sayIsInJvbGUiOiI2NmMyZWQyNDZlODMwZWJjYzcwYTE5YjEiLCJjb21wYW55IjoiNjZjMzY1NTdlMDY0NzNkZGZjZTMyNDViIiwiaWF0IjoxNzI0ODQ5OTY0LCJleHAiOjE3MjYyODk5NjR9.NLwLxsxIa1MX8g5hDC8yncJHE5wPgKtjBzK7Nb6puZg'

    # Headers
    headers = {
        'Authorization': f'Bearer {jwt_token}'
    }

    # Make the GET request to the API
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        company_info = response.json()

        # Save the company info to a .js file
        with open('company_info.js', 'w') as f:
            f.write(f'const companyInfo = {json.dumps(company_info, indent=4)};\n')
            f.write('module.exports = companyInfo;\n')
        
        print("Company information has been saved to company_info.js")
    else:
        print(f"Failed to fetch company information. Status code: {response.status_code}, Message: {response.text}")