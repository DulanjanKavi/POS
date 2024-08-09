import requests
import json
from config import BASE_URL

def get_all_products(data):
    # URL of the API endpoint
    url = f'{BASE_URL}/get-products?status={data["status"]}'

    # Commented-out part to fetch JWT token from the system
    # with open('/path/to/jwt/token/file', 'r') as f:
    #     jwt_token = f.read().strip()

    # Hardcoded JWT token for testing
    jwt_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmFjNzNlZmM4ODVmYmMwYzM4MWYyZWYiLCJmaXJzdF9uYW1lIjoiZGVtbzIiLCJsYXN0X25hbWUiOiJkZW0iLCJlbWFpbCI6ImRlbW9kZW1AZ21haWwuY29tIiwicm9sZSI6IjY2OWUwNDNjOGJkMTUxMmQwNzgzMjBjZSIsImNvbXBhbnkiOiI2NmFjNjk3MmM4ODVmYmMwYzM4MWYyN2IiLCJpYXQiOjE3MjMyMDQ4ODksImV4cCI6MTcyNDY0NDg4OX0.8SKzLx8abqUXopON7Z02ekle2DGPm_cELSFc8It7tak'

    # Headers
    headers = {
        'Authorization': f'Bearer {jwt_token}'
    }

    # Make the GET request to the API
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        products = response.json()

        # Save the company info to a .js file
        with open('all_products.js', 'w') as f:
            f.write(f'const products = {json.dumps(products, indent=4)};\n')
            f.write('module.exports = products;\n')
        
        print("Products has been saved to all_products.js")
    else:
        print(f"Failed to fetch company information. Status code: {response.status_code}, Message: {response.text}")