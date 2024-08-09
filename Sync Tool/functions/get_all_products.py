import requests
import sqlite3
import os
from config import BASE_URL

def get_all_products(data):
    # URL of the API endpoint
    url = f'{BASE_URL}/get-products?status={data["status"]}'

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

        # Insert products into the items table
        current_directory = os.getcwd()
        db_path = os.path.join(current_directory, '..', 'pos.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        for product in products:
            # Convert lists to comma-separated strings
            barcodes = ', '.join(product['barcodes'])
            prices = ', '.join(product['prices'])

            cursor.execute('''
                INSERT INTO items (snumber, name, SKU, thumbnail, inventry_type, IS_active, price, discount)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            ''', (
                product['id'],
                product['name'],
                product['sku'],
                product['thumbnail'],
                product['inventory_type'],
                product['is_active'],
                # barcodes,  # Comma-separated string
                prices     # Comma-separated string
            ))

        conn.commit()
        conn.close()

        print("Products have been successfully saved to the database.")
    else:
        print(f"Failed to fetch products. Status code: {response.status_code}, Message: {response.text}")
