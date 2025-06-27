# Voice Notes App

This is a simple, intuitive web-based voice notes application designed for quick and private note-taking. It leverages your browser's speech recognition capabilities to convert your spoken words into text, which are then securely stored directly within your browser's local database. This ensures 100% privacy, as no data is ever sent to or saved on a server.

## Features
- **Voice-to-Text Recording:** Easily record your thoughts by speaking, and the app will convert them into text notes.
- **Local Storage:** All your notes are saved directly in your browser's local storage, guaranteeing complete privacy.
- **Effortless Note Management:** Start recording with a single key press (Enter/Return), stop recording, and save notes with a click of a button.
- **Export/Import Functionality:** Transfer your notes between browsers or devices using the built-in export and import features (notes are exported as CSV).
- **Search Functionality:** Quickly find your notes with an integrated search bar.

## User Guide

Using the Voice Notes App is designed to be as straightforward as possible:

1.  **Start Recording:** Simply press the `Enter` or `Return` key on your keyboard to begin recording your voice note. The microphone icon will indicate that recording is active.
2.  **Stop Recording:** Press the `Enter` or `Return` key again to stop the recording.
3.  **Save Note:** Once you've stopped recording, you can click the "Save Note" button to store your transcribed note. You can also add a title and manually edit the content before saving.
4.  **Privacy:** Your notes are stored exclusively in your browser's local storage. This means your data remains entirely on your device, ensuring complete privacy and security. Nothing is ever uploaded to a server.
5.  **Export/Import:** To back up your notes or transfer them to another browser/device, use the "Export All" button. To restore notes, use the "Import" button and select your exported CSV file.

## Deployment

This application is a static website, making it incredibly easy and cheap to deploy on platforms like Vercel or Netlify.

### Deploying to Vercel

1.  **Sign up/Log in to Vercel:** If you don't have an account, sign up at [vercel.com](https://vercel.com).
2.  **Import Your Project:**
    *   Push your project code to a Git repository (GitHub, GitLab, Bitbucket).
    *   From the Vercel dashboard, click "New Project".
    *   Select your Git repository and click "Import".
3.  **Configure Project (if needed):** Vercel will usually auto-detect a static site. No special build commands or output directories are typically needed.
4.  **Deploy:** Click "Deploy". Vercel will build and deploy your application, providing you with a live URL.

### Deploying to Netlify

1.  **Sign up/Log in to Netlify:** If you don't have an account, sign up at [netlify.com](https://www.netlify.com/).
2.  **Connect to Git:**
    *   From the Netlify dashboard, click "Add new site" -> "Import an existing project".
    *   Connect to your Git provider (GitHub, GitLab, Bitbucket) and select your repository.
3.  **Configure Build Settings:**
    *   **Branch to deploy:** `main` (or your preferred branch)
    *   **Build command:** Leave empty (or `npm run build` if you add a build step later, but for this static site, it's not needed).
    *   **Publish directory:** Leave empty (or `.` as the root directory contains the `index.html`).
4.  **Deploy Site:** Click "Deploy site". Netlify will deploy your application, providing you with a live URL and continuous deployment for future Git pushes.
