import requests
import sqlite3
import os
from config import BASE_URL
import json

def get_all_products(data):
    # URL of the API endpoint
    print(data)
    url = f'{BASE_URL}/get-products?status={data["status"]}'

    # Hardcoded JWT token for testing
    current_directory = os.environ['EXEC_PATH']
    with open(os.path.join(current_directory, '..', 'userData.json')) as f:
        jwt_token = json.load(f)['token']
    print(jwt_token)    

    # jwt_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmFjNzNlZmM4ODVmYmMwYzM4MWYyZWYiLCJmaXJzdF9uYW1lIjoiZGVtbzIiLCJsYXN0X25hbWUiOiJkZW0iLCJlbWFpbCI6ImRlbW9kZW1AZ21haWwuY29tIiwicm9sZSI6IjY2OWUwNDNjOGJkMTUxMmQwNzgzMjBjZSIsImNvbXBhbnkiOiI2NmFjNjk3MmM4ODVmYmMwYzM4MWYyN2IiLCJpYXQiOjE3MjMyODI1MTYsImV4cCI6MTcyNDcyMjUxNn0.zJT8qX-r6FvfglTt9oK7bWvlqVqAIAopCL5LlbsZUWU'

    # Headers
    headers = {
        'Authorization': f'Bearer {jwt_token}'
    }

    # Make the GET request to the API
    response = requests.get(url, headers=headers)
    print("response loaded")
    if response.status_code == 200:
        products = response.json()

        # Insert products into the items table
        db_path = os.path.join(current_directory, '..', 'pos.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        for product in products:
            # Convert lists to comma-separated strings
            barcodes = product['barcodes']
            prices = product['prices']
            
            # Handling barcodes
            snumber = barcodes[0] if len(barcodes) > 0 else None
            snumber2 = barcodes[1] if len(barcodes) > 1 else None
            
            # Handling prices and discounts
            prices_str = ', '.join(prices)
            discounts_str = ', '.join(['0'] * len(prices))

            try:
                """
                Failed to insert product ගිම්හානයේ පොරොන්දුව - Gimhanaye Poronduwa: NOT NULL constraint failed: items.snumber. Moving to the next pro   oduct.
                """
                cursor.execute('''
                    INSERT INTO items (snumber, snumber2, name, SKU, thumbnail, inventry_type, IS_active, price, discount)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    snumber,
                    snumber2,
                    product['name'],
                    product['sku'],
                    product['thumbnail'],
                    product['inventory_type'],
                    product['is_active'],
                    prices_str,
                    discounts_str
                ))

                conn.commit()
            except sqlite3.IntegrityError as e:
                print(f"Failed to insert product {product['name']}: {e}. Moving to the next product.")
                continue

        conn.close()

        print("Products have been successfully saved to the database.")
    else:
        print(f"Failed to fetch products. Status code: {response.status_code}, Message: {response.text}")