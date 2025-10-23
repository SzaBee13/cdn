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
    // replace all char thats not alphanumeric, dot, hyphen or underscore
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const newFile = new File([file], safeFileName, { type: file.type });

    formData.append('file', newFile);

    fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors'
    })
    .then(response => {
        if (response.ok) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `./${newFile.name}`;
            a.textContent = newFile.name;
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

function deleteFile(filename) {
    fetch('/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: filename }),
        mode: 'cors'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Remove from list
            const listItems = document.querySelectorAll('#file-list li');
            listItems.forEach(li => {
                if (li.innerText.includes(filename)) li.remove();
            });
        } else {
            alert(data.error || 'Delete failed');
        }
    })
    .catch(() => alert('Delete failed'));
}