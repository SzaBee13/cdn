from flask import Flask, request, render_template, send_from_directory, redirect, url_for, jsonify, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import mimetypes
import requests

app = Flask(__name__)
UPLOAD_FOLDER = 'data'
ALLOWED_EXTENSIONS = set(['txt', 'jpg', 'png', 'pdf', 'zip', 'mp4', 'mp3'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# PocketBase configuration
POCKETBASE_URL = os.environ.get('POCKETBASE_URL', 'http://pocketbase:8090')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# CORS for upload and delete from your LAN IP
CORS(app, resources={
    r"/upload": {"origins": "http://192.168.10.89"},
    r"/delete": {"origins": "http://192.168.10.89"},
    r"/*": {"origins": "*"}
})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return render_template('index.html', files=files)

@app.route('/<filename>')
def serve_file(filename):
    safe_name = secure_filename(filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], safe_name)

    if not os.path.exists(path):
        return "File not found", 404

    mime_type, _ = mimetypes.guess_type(path)
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        safe_name,
        mimetype=mime_type
    )

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(url_for('index'))
    file = request.files['file']
    if file.filename == '':
        return redirect(url_for('index'))
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return redirect(url_for('index'))

@app.route('/delete', methods=['POST'])
def delete_file():
    data = request.get_json()
    filename = data.get('filename')
    if not filename:
        return jsonify({"error": "No filename provided"}), 400

    # Prevent directory traversal
    filename = secure_filename(filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    if os.path.exists(path):
        os.remove(path)
        return jsonify({"success": True})
    else:
        return jsonify({"error": "File not found"}), 404

@app.route('/_/', defaults={'path': ''})
@app.route('/_/<path:path>', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
def pocketbase_proxy(path):
    """Reverse proxy for PocketBase"""
    # Construct the target URL
    url = f"{POCKETBASE_URL}/{path}"
    
    # Forward query parameters
    if request.query_string:
        url += '?' + request.query_string.decode('utf-8')
    
    # Prepare headers (exclude host header)
    headers = {key: value for key, value in request.headers if key.lower() != 'host'}
    
    try:
        # Forward the request to PocketBase
        resp = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
            stream=True
        )
        
        # Prepare response headers
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        response_headers = [
            (name, value) for name, value in resp.raw.headers.items()
            if name.lower() not in excluded_headers
        ]
        
        # Return the proxied response
        return Response(
            resp.iter_content(chunk_size=10*1024),
            status=resp.status_code,
            headers=response_headers
        )
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "PocketBase connection failed", "details": str(e)}), 502

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=911)
