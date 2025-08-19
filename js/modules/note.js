import { notesList, noteTitle, noteContent } from './dom.js';
import { startRecording, getIsRecording } from './speech.js';

// ---------- Data helpers ----------
function getNotes() { return JSON.parse(localStorage.getItem('notes')) || []; }
function saveNotes(notes) { localStorage.setItem('notes', JSON.stringify(notes)); }
function saveNote(note) { const notes = getNotes(); notes.push(note); saveNotes(notes); }
function deleteNoteByTimestamp(timestamp) { const notes = getNotes(); const i = notes.findIndex(n => n.timestamp === timestamp); if (i !== -1) { notes.splice(i,1); saveNotes(notes); } }

// ---------- Modal logic ----------
function openNoteModal(note) {
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('note-modal-title');
    const modalTimestamp = document.getElementById('note-modal-timestamp');
    const modalBody = document.getElementById('note-modal-body');
    if (!modal || !modalTitle || !modalTimestamp || !modalBody) return;
    modalTitle.textContent = note.title;
    modalTimestamp.textContent = new Date(note.timestamp).toLocaleString();
    modalBody.textContent = note.content;
    modal.classList.add('active');
}
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('note-modal');
        const closeBtn = document.getElementById('note-modal-close');
        if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('active');
        if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
    });
}

// ---------- UI creation ----------
function createNoteElement(note) {
    const noteDiv = document.createElement('div'); noteDiv.classList.add('note');
    const title = document.createElement('h5'); title.classList.add('card-title'); title.textContent = note.title;
    const content = document.createElement('p'); content.classList.add('note-content');
    const maxPreviewLength = 250, maxPreviewLines = 5; const lines = note.content.split('\n');
    let needsReadMore = note.content.length > maxPreviewLength || lines.length > maxPreviewLines;
    const tempDiv = document.createElement('div'); Object.assign(tempDiv.style, { position:'absolute', visibility:'hidden', overflow:'visible', width:'320px', whiteSpace:'pre-wrap', lineHeight:'inherit' }); tempDiv.className='note-content'; tempDiv.textContent = note.content; document.body.appendChild(tempDiv);
    const cs = window.getComputedStyle(tempDiv); const lineClamp = parseInt(cs.webkitLineClamp || cs.lineClamp || 5); const lineHeight = parseFloat(cs.lineHeight); const maxLines = isNaN(lineClamp)?5:lineClamp; const actualLines = tempDiv.scrollHeight / lineHeight; if (actualLines > maxLines) needsReadMore = true; document.body.removeChild(tempDiv);
    let preview = note.content;
    if (needsReadMore) {
        preview = lines.length > maxPreviewLines ? lines.slice(0,maxPreviewLines).join('\n') : note.content.slice(0,maxPreviewLength);
        content.textContent = preview; content.appendChild(document.createElement('br')); const ellipsis = document.createElement('span'); ellipsis.textContent='...'; ellipsis.style.color='#888'; content.appendChild(ellipsis);
        const readMore = document.createElement('span'); Object.assign(readMore.style,{color:'#007bff',cursor:'pointer',display:'block',marginTop:'8px'}); readMore.className='read-more-link'; readMore.textContent='Read more'; let expanded=false; readMore.addEventListener('click',()=>{expanded=!expanded; if(expanded){content.textContent=note.content; readMore.textContent='Show less'; content.appendChild(document.createElement('br')); content.appendChild(readMore);} else {content.textContent=preview; content.appendChild(document.createElement('br')); content.appendChild(ellipsis); content.appendChild(readMore);} }); content.appendChild(readMore);
    } else { content.textContent = note.content; }
    const timestamp = document.createElement('p'); timestamp.classList.add('note-timestamp'); timestamp.textContent = new Date(note.timestamp).toLocaleString();
    const buttonsDiv = document.createElement('div'); buttonsDiv.classList.add('note-buttons');
    const delBtn = document.createElement('button'); delBtn.innerHTML='<i class="fas fa-trash"></i>'; delBtn.title='Delete'; delBtn.addEventListener('click',()=>{ if(confirm('Are you sure you want to delete this note?')) { deleteNoteByTimestamp(note.timestamp); renderNotes(); } });
    const shareBtn = document.createElement('button'); shareBtn.innerHTML='<i class="fas fa-share-alt"></i>'; shareBtn.title='Share'; shareBtn.addEventListener('click',()=>shareNote(note));
    const exportBtn = document.createElement('button'); exportBtn.innerHTML='<i class="fas fa-file-export"></i>'; exportBtn.title='Export'; exportBtn.addEventListener('click',()=>exportNote(note));
    const copyBtn = document.createElement('button'); copyBtn.innerHTML='<i class="fas fa-copy"></i>'; copyBtn.title='Copy'; copyBtn.addEventListener('click',()=>copyNoteToClipboard(note));
    const expandBtn = document.createElement('button'); expandBtn.innerHTML='<i class="fas fa-expand"></i>'; expandBtn.title='Expand'; expandBtn.addEventListener('click',()=>openNoteModal(note));
    [expandBtn, delBtn, shareBtn, exportBtn, copyBtn].forEach(b=>buttonsDiv.appendChild(b));
    noteDiv.appendChild(title); noteDiv.appendChild(content); const footerDiv = document.createElement('div'); footerDiv.classList.add('note-footer'); footerDiv.appendChild(timestamp); footerDiv.appendChild(buttonsDiv); noteDiv.appendChild(footerDiv);
    return noteDiv;
}

// ---------- Actions ----------
function shareNote(note) {
    if (navigator.share) {
        navigator.share({ title: note.title, text: note.content })
            .then(()=>console.log('Successful share'))
            .catch(err=>console.log('Error sharing', err));
    } else {
        const textToCopy = `Title: ${note.title}\n\nContent: ${note.content}`;
        navigator.clipboard.writeText(textToCopy).then(()=>alert('Note content (title and body) copied to clipboard!'))
            .catch(err=>{ console.error('Failed to copy text for sharing:', err); alert('Could not copy note to clipboard. Please copy manually:\n\n'+textToCopy);});
    }
}
function exportNote(note){ const blob=new Blob([note.content],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${note.title}.txt`; a.click(); URL.revokeObjectURL(url); }
function copyNoteToClipboard(note){ navigator.clipboard.writeText(note.content).then(()=>alert('Note content copied to clipboard!')).catch(err=>console.error('Failed to copy text:',err)); }

// ---------- Rendering ----------
export function renderNotes(searchTerm=''){ notesList.innerHTML=''; let notes=getNotes(); if(searchTerm){ const lower=searchTerm.toLowerCase(); notes=notes.filter(n=>n.title.toLowerCase().includes(lower)||n.content.toLowerCase().includes(lower)); } notes.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); notes.forEach(n=>notesList.appendChild(createNoteElement(n))); }

// ---------- Handlers ----------
export function handleSaveNote(){ let title=noteTitle.value.trim(); const content=noteContent.value.trim(); if(!title){ if(content){ title=content.split(' ').slice(0,10).join(' '); noteTitle.value=title; } else { if(!getIsRecording()) startRecording(); return; } } if(content){ saveNote({ title, content, timestamp:new Date().toISOString() }); renderNotes(); noteTitle.value=''; noteContent.value=''; } }
export function handleExportAll(){ const notes=getNotes(); if(!notes.length){ alert('No notes to export.'); return; } const csvContent='data:text/csv;charset=utf-8,'+'timestamp,title,content\n'+notes.map(e=>`"${e.timestamp}","${e.title}","${e.content}"`).join('\n'); const encodedUri=encodeURI(csvContent); const link=document.createElement('a'); link.setAttribute('href',encodedUri); const now=new Date(); const pad=n=>n.toString().padStart(2,'0'); const filename=`notes-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`; link.setAttribute('download',filename); document.body.appendChild(link); link.click(); }
export function handleImport(e){ const file=e.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload=ev=>{ const content=ev.target.result; const rows=content.split('\n').slice(1); rows.forEach(row=>{ if(!row.trim()) return; const [timestamp,title,nc]=row.split(','); if(timestamp&&title&&nc){ saveNote({ timestamp:timestamp.replace(/"/g,''), title:title.replace(/"/g,''), content:nc.replace(/"/g,'') }); } }); renderNotes(); }; reader.readAsText(file); }
export function checkSharedNote(){ const params=new URLSearchParams(window.location.search); const data=params.get('note'); if(data){ try{ const decoded=JSON.parse(atob(data)); noteTitle.value=decoded.title; noteContent.value=decoded.content; } catch(err){ console.error('Error parsing shared note data:',err); } } }
