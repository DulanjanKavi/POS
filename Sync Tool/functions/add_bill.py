import requests
import sqlite3
import os
import json
from config import BASE_URL

def add_bill(data):
    # URL of the API endpoint
    print("Processing data:", data)
    url = f'{BASE_URL}/inventory-manager/sn/create'

    # Get the JWT token
    current_directory = os.environ['EXEC_PATH']
    with open(os.path.join(current_directory, '..', 'user_data.json')) as f:
        jwt_token = json.load(f)['token']
    print("JWT Token:", jwt_token)

    # Headers
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Content-Type': 'application/json'  # Assuming the API expects JSON data
    }

    # Prepare the data to be sent to the API
    bill_data = {
        "branch_id": data["branch_id"],
        "sale_date": data["sale_date"],
        "status": data["status"],
        "items": data["items"],
        "total_amount": data["total_amount"],
        "discount": data["discount"],
        "adjustment": data["adjustment"],
        "tax": data["tax"],
        "delivery_fee": data["delivery_fee"],
        "payment_method": data["payment_method"],
        "payment_status": data["payment_status"],
        "custom_fields": data["custom_fields"],
        "notes": data.get("notes", "")  # Optional field
    }

    # Send the POST request to the API
    response = requests.post(url, headers=headers, json=bill_data)

    print("Response from API:", response.status_code)
    if response.status_code == 201 or response.status_code == 200:
        print("Bill has been successfully uploaded.")
    else:
        print(f"Failed to upload bill. Status code: {response.status_code}, Message: {response.text}")
        # Log the error for later debugging
        with open(os.path.join(os.environ['EXEC_PATH'], 'log.txt'), 'a') as f:
            f.write(f"Error uploading bill: {response.text}\n")