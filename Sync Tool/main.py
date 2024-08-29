import sqlite3
import json
import threading
import time
import os
import importlib.util
from systemTray import start_system_tray_icon
import ipc_http

is_running = True

"""
Creating gable queue table if not exists
DEV --- Namindu
"""
def create_queue_table():
    current_directory = os.environ['EXEC_PATH']
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS queue (action TEXT, data TEXT, status TEXT)")
    conn.commit()
    conn.close()



# Function to load a function from a module
def load_function(module_name, func_name):
    try:
        # Construct the module path
        print(os.getcwd())
        module_path = os.path.join(os.environ['EXEC_PATH'], 'functions', f'{module_name}.py')
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Retrieve the function from the module
        func = getattr(module, func_name)
        return func
    except (FileNotFoundError, AttributeError) as e:
        print(f"Error loading {func_name} from {module_name}: {e}")
        # write to log file
        with open(os.path.join(os.environ['EXEC_PATH'], 'log.txt'), 'a') as f:
            f.write(f"Error loading {func_name} from {module_name}: {e}\n")
        return None

# Function to read the queue and execute actions
def process_queue():
    # Get the path to the pos.db file
    current_directory = os.environ['EXEC_PATH']
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
                with open(os.path.join(os.environ['EXEC_PATH'], 'log.txt'), 'a') as f:
                    f.write(f"Executing {action}\n")
                func(data)
                
                # Update status to 'completed' if successful
                cursor.execute("UPDATE queue SET status='completed' WHERE rowid=?", (rowid,))
            except Exception as e:
                print(f"Error executing {action}: {e} ")
                print(e.__traceback__)
                # Update status to 'failed' on error
                cursor.execute("UPDATE queue SET status='failed' WHERE rowid=?", (rowid,))
                # write to log file
                with open(os.path.join(os.environ['EXEC_PATH'], 'log.txt'), 'a') as f:
                    f.write(f"Error executing {action}: {e}\n")
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

def add_ex2():
    current_directory = os.getcwd()
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO queue (action, data, status) VALUES ('get_company_info', '{\"id\":\"66c36557e06473ddfce3245b\"}', 'pending')")
    conn.commit()
    conn.close()

# Function to run the process_queue function every 30 seconds for testing
def run_scheduler():
    while is_running:
        process_queue()
        # add_ex()
        # add_ex2()
        time.sleep(30)  # Sleep for 30 seconds for testing (change to 300 for production)

if __name__ == "__main__":
    dirname, filename = os.path.split(os.path.abspath(__file__))
    # add to env
    os.environ['EXEC_PATH'] = dirname

    create_queue_table()
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()

    httpd_thread = threading.Thread(target=ipc_http.start_server)
    httpd_thread.daemon = True
    httpd_thread.start()

    start_system_tray_icon()
    is_running = False
    ipc_http.httpd.shutdown()
    scheduler_thread.join()
    httpd_thread.join()
