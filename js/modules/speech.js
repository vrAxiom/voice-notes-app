import { noteContent, micBtn, saveBtn } from './dom.js';

let recognition;
let isRecording = false;
let shouldSaveAfterStop = false;

export function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            micBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            micBtn.classList.add('btn-danger');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    noteContent.value += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
            micBtn.classList.remove('btn-danger');

            if (shouldSaveAfterStop) {
                saveBtn.click();
                shouldSaveAfterStop = false;
            }
        };

        micBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        micBtn.style.display = 'none';
        console.warn('Speech recognition not supported in this browser.');
    }
}

export function startRecording() {
    if (recognition && !isRecording) {
        recognition.start();
    }
}

export function stopRecording() {
    if (recognition && isRecording) {
        recognition.stop();
    }
}

export function setShouldSaveAfterStop(value) {
    shouldSaveAfterStop = value;
}

export function getIsRecording() {
    return isRecording;
}
