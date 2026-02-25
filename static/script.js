// Initialize PocketBase - Update this URL to your PocketBase instance
// Use localhost for browser access (PocketBase runs on host network)
const pb = new PocketBase('http://localhost:9111');

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const fileList = document.getElementById('file-list');
const uploadStatus = document.getElementById('upload-status');
const uploadArea = document.getElementById('upload-area');

// Auth UI Elements
const loggedIn = document.getElementById('logged-in');
const loggedOut = document.getElementById('logged-out');
const userEmail = document.getElementById('user-email');
const loginForm = document.getElementById('login-form');
const publicToggle = document.getElementById('public-toggle');
const apiTokenSection = document.getElementById('api-token-section');
const apiTokenDisplay = document.getElementById('api-token-display');
let currentFileForCopy = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFiles();
    setupEventListeners();
});

// Check authentication status
function checkAuth() {
    if (pb.authStore.isValid) {
        showLoggedIn();
    } else {
        showLoggedOut();
    }
}

function showLoggedIn() {
    loggedIn.classList.remove('hidden');
    loggedIn.classList.add('flex');
    loggedOut.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    userEmail.textContent = pb.authStore.model?.email || 'User';
}

function showLoggedOut() {
    loggedIn.classList.add('hidden');
    loggedOut.classList.remove('hidden');
    uploadArea.classList.add('hidden');
}

function setupEventListeners() {
    // Show/hide forms
    document.getElementById('show-login').addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        apiTokenSection.classList.add('hidden');
    });

    document.getElementById('cancel-login').addEventListener('click', () => {
        loginForm.classList.add('hidden');
    });

    // API Token
    document.getElementById('show-api-token').addEventListener('click', () => {
        apiTokenSection.classList.remove('hidden');
        loginForm.classList.add('hidden');
        apiTokenDisplay.value = pb.authStore.token || 'No token available';
    });

    document.getElementById('close-api-token').addEventListener('click', () => {
        apiTokenSection.classList.add('hidden');
    });

    document.getElementById('copy-token').addEventListener('click', () => {
        apiTokenDisplay.select();
        document.execCommand('copy');
        const btn = document.getElementById('copy-token');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
    });

    // Login
    document.getElementById('login-submit').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await pb.collection('users').authWithPassword(email, password);
            loginForm.classList.add('hidden');
            showLoggedIn();
            loadFiles();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        pb.authStore.clear();
        showLoggedOut();
        fileList.innerHTML = '';
        apiTokenSection.classList.add('hidden');
    });

    // File upload events
    dropArea.addEventListener('click', () => {
        if (pb.authStore.isValid) {
            fileElem.click();
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            if (pb.authStore.isValid) {
                dropArea.classList.add('border-blue-400');
            }
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.remove('border-blue-400');
        }, false);
    });

    dropArea.addEventListener('drop', (e) => {
        if (pb.authStore.isValid) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
    });

    fileElem.addEventListener('change', (e) => {
        handleFiles(fileElem.files);
    });
}

function handleFiles(files) {
    [...files].forEach(uploadFile);
}

async function uploadFile(file) {
    try {
        // Replace all chars that are not alphanumeric, dot, hyphen or underscore
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const newFile = new File([file], safeFileName, { type: file.type });

        const formData = new FormData();
        formData.append('file', newFile);
        formData.append('user', pb.authStore.model.id);
        formData.append('public', publicToggle.checked);

        const record = await pb.collection('files').create(formData);
        
        uploadStatus.textContent = 'Upload successful!';
        setTimeout(() => uploadStatus.textContent = '', 3000);
        
        // Add to file list
        addFileToList(record);
    } catch (error) {
        uploadStatus.textContent = 'Upload failed: ' + error.message;
        console.error(error);
    }
}

async function loadFiles() {
    try {
        let records;
        if (pb.authStore.isValid) {
            // Logged in users see their own files + public files
            records = await pb.collection('files').getList(1, 50, {
                sort: '-created',
                filter: `user = "${pb.authStore.model.id}" || public = true`
            });
        } else {
            // Non-logged in users only see public files
            records = await pb.collection('files').getList(1, 50, {
                sort: '-created',
                filter: 'public = true'
            });
        }

        fileList.innerHTML = '';
        records.items.forEach(record => addFileToList(record));
    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

function addFileToList(record) {
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center gap-2';
    li.dataset.recordId = record.id;

    const a = document.createElement('a');
    // Get the file path from PocketBase and construct URL with current domain
    const filePath = pb.files.getUrl(record, record.file);
    // Extract just the path portion after the domain
    const urlObj = new URL(filePath);
    const relativePath = urlObj.pathname;
    // Use current page's origin + the path
    const baseUrl = window.location.origin + relativePath;
    
    // For private files, add token parameter
    let fileUrl = baseUrl;
    if (!record.public && pb.authStore.isValid) {
        fileUrl = baseUrl + '?token=' + pb.authStore.token;
    }
    
    a.href = fileUrl;
    a.textContent = record.file + (record.public ? ' 🌐' : ' 🔒');
    a.target = '_blank';
    a.className = 'text-blue-500 hover:underline flex-1';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-1';

    // Copy URL button
    const copyUrlBtn = document.createElement('button');
    copyUrlBtn.textContent = '📋';
    copyUrlBtn.title = 'Copy URL';
    copyUrlBtn.className = 'text-gray-500 hover:text-gray-700 px-2';
    copyUrlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(fileUrl).then(() => {
            copyUrlBtn.textContent = '✓';
            setTimeout(() => copyUrlBtn.textContent = '📋', 2000);
        });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'text-red-500 hover:text-red-700 text-sm';
    deleteBtn.addEventListener('click', () => deleteFile(record.id));

    // Add copy button for all users who can see the file
    buttonContainer.appendChild(copyUrlBtn);
    
    // Only show delete button if user owns the file
    if (pb.authStore.isValid && record.user === pb.authStore.model.id) {
        buttonContainer.appendChild(deleteBtn);
    }
    
    li.appendChild(a);
    li.appendChild(buttonContainer);
    fileList.appendChild(li);
}

async function deleteFile(recordId) {
    try {
        await pb.collection('files').delete(recordId);
        
        // Remove from list
        const li = document.querySelector(`li[data-record-id="${recordId}"]`);
        if (li) li.remove();
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
}