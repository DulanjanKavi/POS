import sqlite3
import json

# Create the queue table
conn = sqlite3.connect('pos.db')
cursor = conn.cursor()

# Insert a test row
cursor.execute('''
INSERT INTO queue (action, data, status)
VALUES (?, ?, ?)
''', ('add_product', json.dumps({"ID": "12247928347"}), 'pending'))

conn.commit()
conn.close()
