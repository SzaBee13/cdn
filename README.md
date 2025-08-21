# Simple Flask CDN with Drag-and-Drop Upload

A lightweight CDN-like server built with Flask, allowing file uploads via drag-and-drop or click, and serving files over HTTP. TailwindCSS is used for a simple, clean frontend.

## Features

- Drag-and-drop or click-to-upload files.
- Serves files directly via `/filename`.
- Dynamic file list updates after upload.
- CORS enabled for `/upload` from a specific LAN IP.
- Dockerized for easy deployment.
- Uses a persistent `data/` folder for uploaded files.

## Requirements

- Docker & Docker Compose
- Modern browser (Chrome, Firefox, Edge)
- Python 3.12+ (for local testing without Docker)

## Folder Structure
```
cdn_project/
├─ server.py
├─ templates/
│ └─ index.html
├─ static/
│ └─ favicon.ico
├─ data/
├─ Dockerfile
├─ docker-compose.yml
├─ requirements.txt
├─ .dockerignore
├─ .gitignore
├─ README.md
└─ LICENSE.md
```

## Usage

### Docker

1. Build and run:

```bash
docker-compose up --build
```

2. Open your browser:
http://hostpc:911/

### Local (without Docker)

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python server.py
```

3. Open your browser:
http://localhost:911/

## Notes
- Ensure your /data folder is writable; files are persisted here.
- Update CORS in server.py if your LAN IP changes.