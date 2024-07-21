import sqlite3
import json
import threading
import time
import os
import importlib

# Function to read the queue and execute actions
def process_queue():
    # Get the path to the pos.db file
    current_directory = os.getcwd()
    db_path = os.path.join(current_directory, '..', 'pos.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Fetch actions with status 'pending'
    cursor.execute("SELECT rowid, action, data FROM queue WHERE status='pending'")
    rows = cursor.fetchall()
    print(rows)

    for row in rows:
        rowid, action, data = row
        if (data.startswith("{") and data.endswith("}")) or (data.startswith("[") and data.endswith("]")):
            data = json.loads(data)

        try:
            # Dynamically import the function
            module = importlib.import_module('functions')
            func = getattr(module, action)
            func(data)
            
            # Update status to 'success'
            cursor.execute("UPDATE queue SET status='completed' WHERE rowid=?", (rowid,))
        except (ModuleNotFoundError, AttributeError) as e:
            print(f"Function not found: {e}")
            # Update status to 'failed'
            cursor.execute("UPDATE queue SET status='failed' WHERE rowid=?", (rowid,))
        except Exception as e:
            print(f"Error: {e}")
            # Update status to 'failed'
            cursor.execute("UPDATE queue SET status='failed' WHERE rowid=?", (rowid,))

        conn.commit()

    conn.close()

# Function to add an example action to the queue
def add_ex():
    current_directory = os.getcwd()
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO queue (action, data, status) VALUES ('print_word', '{\"word\":\"World\"}', 'pending')")
    conn.commit()
    conn.close()

# Function to run the process_queue function every five minutes
def run_scheduler():
    while True:
        process_queue()
        add_ex()
        add_ex()
        time.sleep(30)  # Sleep for 300 seconds (5 minutes)

if __name__ == "__main__":
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.start()
