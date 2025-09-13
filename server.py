from flask import Flask, request, render_template, send_from_directory, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import mimetypes

app = Flask(__name__)
UPLOAD_FOLDER = 'data'
ALLOWED_EXTENSIONS = set(['txt', 'jpg', 'png', 'pdf', 'zip', 'mp4', 'mp3'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=911)
