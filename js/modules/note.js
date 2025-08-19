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
    // Enhanced Read More functionality
    const maxPreviewLength = 250;
    const maxPreviewLines = 5;
    let lines = note.content.split('\n');
    let needsReadMore = note.content.length > maxPreviewLength || lines.length > maxPreviewLines;

    // Detect visual overflow using a hidden clone and line clamp math
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.overflow = 'visible';
    tempDiv.style.width = '320px'; // Approx note card width
    tempDiv.style.font = 'inherit';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.lineHeight = 'inherit';
    tempDiv.style.padding = '15px';
    tempDiv.className = 'note-content';
    tempDiv.textContent = note.content;
    document.body.appendChild(tempDiv);
    const computed = window.getComputedStyle(tempDiv);
    const lineClamp = parseInt(computed.webkitLineClamp || computed.lineClamp || 5);
    const lineHeight = parseFloat(computed.lineHeight);
    const maxLines = isNaN(lineClamp) ? 5 : lineClamp;
    const maxHeight = lineHeight * maxLines;
    const actualLines = tempDiv.scrollHeight / lineHeight;
    if (actualLines > maxLines) {
        needsReadMore = true;
    }
    document.body.removeChild(tempDiv);

    let preview = note.content;
    if (needsReadMore) {
        // Show only first N lines or chars, whichever is shorter
        if (lines.length > maxPreviewLines) {
            preview = lines.slice(0, maxPreviewLines).join('\n');
        } else {
            preview = note.content.slice(0, maxPreviewLength);
        }
        content.textContent = preview;
        content.appendChild(document.createElement('br'));
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.color = '#888';
        content.appendChild(ellipsis);

        const readMore = document.createElement('span');
        readMore.className = 'read-more-link';
        readMore.textContent = 'Read more';
        readMore.style.color = '#007bff';
        readMore.style.cursor = 'pointer';
        readMore.style.display = 'block';
        readMore.style.marginTop = '8px';

        let expanded = false;
        readMore.addEventListener('click', () => {
            expanded = !expanded;
            if (expanded) {
                content.textContent = note.content;
                readMore.textContent = 'Show less';
                content.appendChild(document.createElement('br'));
                content.appendChild(readMore);
            } else {
                content.textContent = preview;
                content.appendChild(document.createElement('br'));
                content.appendChild(ellipsis);
                content.appendChild(readMore);
            }
        });
        content.appendChild(readMore);
    } else {
        content.textContent = note.content;
    }

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
            deleteNote(note.timestamp);
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

    // Expand button (always visible)
    const expandBtn = document.createElement('button');
    expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
    expandBtn.title = 'Expand';
    expandBtn.addEventListener('click', () => {
        openNoteModal(note);
    });
    buttonsDiv.appendChild(expandBtn);
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

// Modal logic for full note view
function openNoteModal(note) {
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('note-modal-title');
    const modalTimestamp = document.getElementById('note-modal-timestamp');
    const modalBody = document.getElementById('note-modal-body');
    modalTitle.textContent = note.title;
    modalTimestamp.textContent = new Date(note.timestamp).toLocaleString();
    modalBody.textContent = note.content;
    modal.classList.add('active');
}

// Close logic
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('note-modal');
        const closeBtn = document.getElementById('note-modal-close');
        if (closeBtn) {
            closeBtn.onclick = function () {
                modal.classList.remove('active');
            };
        }
        // Close modal when clicking outside content
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });
}


function deleteNote(timestamp) {
    const notes = getNotes();
    const idx = notes.findIndex(note => note.timestamp === timestamp);
    if (idx !== -1) {
        notes.splice(idx, 1);
        saveNotes(notes);
    }
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
    // Format: notes-YYYYMMDD-HHMMSS.csv
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const h = pad(now.getHours());
    const min = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    const filename = `notes-${y}${m}${d}-${h}${min}${s}.csv`;
    link.setAttribute('download', filename);
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
