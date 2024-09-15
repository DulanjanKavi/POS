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
    userData = {}
    with open(os.path.join(current_directory, '..', 'user_data.json')) as f:
        userData = json.load(f)
        jwt_token = userData['token']
    
    # jwt_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmMzNjU3NGUwNjQ3M2RkZmNlMzI0NzEiLCJmaXJzdF9uYW1lIjoiQW1hbGkiLCJsYXN0X25hbWUiOiJCb29rcyIsImVtYWlsIjoiYW1hbGlib29rc0BuYW1pc3dlYi5sayIsInJvbGUiOiI2NmMyZWQyNDZlODMwZWJjYzcwYTE5YjEiLCJjb21wYW55IjoiNjZjMzY1NTdlMDY0NzNkZGZjZTMyNDViIiwiaWF0IjoxNzI0ODQ5OTY0LCJleHAiOjE3MjYyODk5NjR9.NLwLxsxIa1MX8g5hDC8yncJHE5wPgKtjBzK7Nb6puZg'
    if not jwt_token:
        raise Exception("JWT token not found")
    
    # Headers
    headers = {
        'Authorization': f'Bearer {jwt_token}'
    }

    # Make the GET request to the API
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        company_info = response.json()

        # Save the company info to a .js file
        userData['company'] = {
            'id': data['_id'],
            'name': company_info['name'],
            'brn': company_info['brn'],
            'address': company_info['address'],
            'phone': company_info['phone'],
            'email': company_info['email'],
            'branches': company_info['branches']
        }

        with open(os.path.join(current_directory, '..', 'user_data.json'), 'w') as f:
            json.dump(userData, f, indent=4)

        # with open('company_info.js', 'w') as f:
        #     f.write(f'const companyInfo = {json.dumps(company_info, indent=4)};\n')
        #     f.write('module.exports = companyInfo;\n')
        
        print("Company information has been saved to company_info.js")
    else:
        print(f"Failed to fetch company information. Status code: {response.status_code}, Message: {response.text}")