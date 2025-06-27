import { saveBtn, exportAllBtn, importBtn, importFile, searchBar } from './modules/dom.js';
import { setupSpeechRecognition, stopRecording, setShouldSaveAfterStop, getIsRecording } from './modules/speech.js';
import { renderNotes, handleSaveNote, handleExportAll, handleImport, checkSharedNote } from './modules/note.js';

document.addEventListener('DOMContentLoaded', () => {
    // Handle the disclaimer alert
    const disclaimerAlert = document.querySelector('.alert-warning');
    const DISCLAIMER_STORAGE_KEY = 'voiceNotesDisclaimerDismissed';

    if (localStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true') {
        disclaimerAlert.style.display = 'none';
    }

    disclaimerAlert.addEventListener('closed.bs.alert', function () {
        localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    });

    setupSpeechRecognition();
    renderNotes();
    checkSharedNote();

    searchBar.addEventListener('input', (e) => {
        renderNotes(e.target.value);
    });

    saveBtn.addEventListener('click', handleSaveNote);
    exportAllBtn.addEventListener('click', handleExportAll);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && document.activeElement.tagName !== 'TEXTAREA') {
            event.preventDefault();

            if (getIsRecording()) {
                setShouldSaveAfterStop(true);
                stopRecording();
            } else {
                handleSaveNote();
            }
        }
    });
});
