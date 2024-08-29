"""
This module provides a simple HTTP server that can be used to communicate with
the main application. It listens for POST requests and executes the corresponding
action from the queue.

Actions: 
    -- Add ation to queue
    -- Check status of sheduler
"""
import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer

httpd = None

def add_to_queue(action, data):
    current_directory = os.environ['EXEC_PATH']
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO queue (action, data, status) VALUES (?, ?, 'pending')", (action, json.dumps(data)))
    conn.commit()
    conn.close()


def get_queue(status):
    current_directory = os.environ['EXEC_PATH']
    db_path = os.path.join(current_directory, '..', 'pos.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    if status:
        cursor.execute("SELECT rowid, action, data, status FROM queue WHERE status=?", (status,))
    else:
        cursor.execute("SELECT rowid, action, data, status FROM queue")
    rows = cursor.fetchall()
    conn.close()
    return rows


# handle POST requests
class request_handler(BaseHTTPRequestHandler):
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        response = {'status': 'ok'}

        # parse the request data
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            response = {'status': 'error', 'message': 'Invalid JSON data.'}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        if data['action'] == 'add_to_queue':
            add_to_queue(data['queue_action'], data['data'])
            response = {'status': 'ok', 'message': 'Action added to queue.'}
        elif data['action'] == 'get_queue':
            status = data.get('status', None)

            queue = get_queue(status)
            response = {'status': 'ok', 'queue': queue, 'path': os.environ['EXEC_PATH']}
        elif data['action'] == 'check_scheduler':
            response = {'status': 'ok', 'message': 'Scheduler is running.'}
        else:
            print(f"Action '{data['action']}' not found.")
            response = {'status': 'error', 'message': f"Action '{data['action']}' not found."}
        
        self.wfile.write(json.dumps(response).encode('utf-8'))

    

# start the server
def start_server():
    global httpd
    server_address = ('', 24332)
    httpd = HTTPServer(server_address, request_handler)
    print('Starting server on port 24332...')
    httpd.serve_forever()


if __name__ == '__main__':
    start_server()