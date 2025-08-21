const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const fileList = document.getElementById('file-list');
const uploadStatus = document.getElementById('upload-status');

dropArea.addEventListener('click', () => fileElem.click());

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropArea.classList.add('border-blue-400');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-blue-400');
    }, false);
});

dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
});

fileElem.addEventListener('change', (e) => {
    handleFiles(fileElem.files);
});

function handleFiles(files) {
    [...files].forEach(uploadFile);
}

function uploadFile(file) {
    const url = '/upload';
    const formData = new FormData();
    formData.append('file', file);

    fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors'
    })
    .then(response => {
        if (response.ok) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '/' + encodeURIComponent(file.name);
            a.textContent = file.name;
            a.classList.add('text-blue-500', 'hover:underline');
            li.appendChild(a);
            fileList.appendChild(li);
            uploadStatus.textContent = 'Upload successful!';
            setTimeout(() => uploadStatus.textContent = '', 3000);
        } else {
            uploadStatus.textContent = 'Upload failed!';
        }
    })
    .catch(() => {
        uploadStatus.textContent = 'Upload failed!';
    });
}