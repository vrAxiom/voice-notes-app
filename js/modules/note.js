import { notesList, noteTitle, noteContent } from './dom.js';
import { startRecording, getIsRecording } from './speech.js';

function getNotes() {
    return JSON.parse(localStorage.getItem('notes')) || [];
}

function saveNotes(notes) {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function saveNote(note) {
    const notes = getNotes();
    notes.push(note);
    saveNotes(notes);
}

function createNoteElement(note, index) {
    const noteDiv = document.createElement('div');
    noteDiv.classList.add('note');

    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = note.title;

    const content = document.createElement('p');
    content.classList.add('note-content');
    content.textContent = note.content;

    const timestamp = document.createElement('p');
    timestamp.classList.add('note-timestamp');
    timestamp.textContent = new Date(note.timestamp).toLocaleString();

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('note-buttons');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(index);
            renderNotes();
        }
    });

    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
    shareBtn.title = 'Share';
    shareBtn.addEventListener('click', () => {
        shareNote(note);
    });

    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i>';
    exportBtn.title = 'Export';
    exportBtn.addEventListener('click', () => {
        exportNote(note);
    });

    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy';
    copyBtn.addEventListener('click', () => {
        copyNoteToClipboard(note);
    });

    buttonsDiv.appendChild(deleteBtn);
    buttonsDiv.appendChild(shareBtn);
    buttonsDiv.appendChild(exportBtn);
    buttonsDiv.appendChild(copyBtn);

    noteDiv.appendChild(title);
    noteDiv.appendChild(content);
    const footerDiv = document.createElement('div');
    footerDiv.classList.add('note-footer');
    footerDiv.appendChild(timestamp);
    footerDiv.appendChild(buttonsDiv);
    noteDiv.appendChild(footerDiv);

    return noteDiv;
}

function deleteNote(index) {
    const notes = getNotes();
    notes.splice(index, 1);
    saveNotes(notes);
}

function shareNote(note) {
    const noteData = {
        title: note.title,
        content: note.content,
    };
    if (navigator.share) {
        navigator.share({
            title: note.title,
            text: note.content,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
        const textToCopy = `Title: ${note.title}\n\nContent: ${note.content}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Note content (title and body) copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text for sharing: ', err);
            alert('Could not copy note to clipboard. Please copy manually:\n\n' + textToCopy);
        });
    }
}

function exportNote(note) {
    const blob = new Blob([note.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function copyNoteToClipboard(note) {
    navigator.clipboard.writeText(note.content).then(() => {
        alert('Note content copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

export function renderNotes(searchTerm = '') {
    notesList.innerHTML = '';
    let notes = getNotes();
    if (searchTerm) {
        notes = notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    notes.forEach((note, index) => {
        const noteElement = createNoteElement(note, index);
        notesList.appendChild(noteElement);
    });
}

export function handleSaveNote() {
    let title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title) {
        if (content) {
            title = content.split(' ').slice(0, 10).join(' ');
            noteTitle.value = title;
        } else {
            if (!getIsRecording()) {
                startRecording();
            }
            return;
        }
    }

    if (content) {
        const note = {
            title,
            content,
            timestamp: new Date().toISOString(),
        };
        saveNote(note);
        renderNotes();
        noteTitle.value = '';
        noteContent.value = '';
    }
}

export function handleExportAll() {
    const notes = getNotes();
    if (notes.length === 0) {
        alert('No notes to export.');
        return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,'
        + 'timestamp,title,content\n'
        + notes.map(e => `"${e.timestamp}","${e.title}","${e.content}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'notes.csv');
    document.body.appendChild(link);
    link.click();
}

export function handleImport(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const rows = content.split('\n').slice(1);
        rows.forEach(row => {
            const [timestamp, title, noteContent] = row.split(',');
            if (timestamp && title && noteContent) {
                const note = {
                    timestamp: timestamp.replace(/"/g, ''),
                    title: title.replace(/"/g, ''),
                    content: noteContent.replace(/"/g, ''),
                };
                saveNote(note);
            }
        });
        renderNotes();
    };
    reader.readAsText(file);
}

export function checkSharedNote() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedNoteData = urlParams.get('note');
    if (sharedNoteData) {
        try {
            const decodedData = JSON.parse(atob(sharedNoteData));
            noteTitle.value = decodedData.title;
            noteContent.value = decodedData.content;
        } catch (error) {
            console.error('Error parsing shared note data:', error);
        }
    }
}
