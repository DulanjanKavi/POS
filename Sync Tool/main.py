import sqlite3
import json
import threading
import time
import os
import importlib.util

# Function to load a function from a module
def load_function(module_name, func_name):
    try:
        # Construct the module path
        module_path = os.path.join(os.getcwd(), 'functions', f'{module_name}.py')
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Retrieve the function from the module
        func = getattr(module, func_name)
        return func
    except (FileNotFoundError, AttributeError) as e:
        print(f"Error loading {func_name} from {module_name}: {e}")
        return None

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

        # Load the corresponding function from its module
        func = load_function(action, action)
        if func:
            try:
                func(data)
                
                # Update status to 'completed' if successful
                cursor.execute("UPDATE queue SET status='completed' WHERE rowid=?", (rowid,))
            except Exception as e:
                print(f"Error executing {action}: {e}")
                # Update status to 'failed' on error
                cursor.execute("UPDATE queue SET status='failed' WHERE rowid=?", (rowid,))
        else:
            # Update status to 'failed' if function is not found
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

def add_ex3():
    current_directory = os.getcwd()
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO queue (action, data, status) VALUES ('get_all_products', '{\"status\":\"all\"}', 'pending')")
    conn.commit()
    conn.close()

def add_ex2():
    current_directory = os.getcwd()
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO queue (action, data, status) VALUES ('get_company_info', '{\"id\":\"66ac6972c885fbc0c381f27b\"}', 'pending')")
    conn.commit()
    conn.close()

# Function to run the process_queue function every 30 seconds for testing
def run_scheduler():
    while True:
        process_queue()
        add_ex3()
        add_ex2()
        time.sleep(30)  # Sleep for 30 seconds for testing (change to 300 for production)

if __name__ == "__main__":
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.start()
