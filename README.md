# Pet Care Tracking

Welcome to the Pet Care Tracking App! This project helps pet owners manage and track their pets in a user-friendly mobile application.

<h3 align="left">Languages and Tools:</h3>
<p align="left"> <a href="https://www.figma.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/figma/figma-icon.svg" alt="figma" width="40" height="40"/> </a> <a href="https://firebase.google.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" alt="firebase" width="40" height="40"/> </a> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a> <a href="https://reactnative.dev/" target="_blank" rel="noreferrer"> <img src="https://reactnative.dev/img/header_logo.svg" alt="reactnative" width="40" height="40"/> </a> <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="tailwind" width="40" height="40"/> </a> </p>

## Installation Guide

Follow these steps to successfully set up and run the project locally:

### Prerequisites
- Node.js (LTS version recommended)
- npm (or yarn)
- Git
- Firebase Account
- Google Cloud Account

### Step 1: Clone the Repository

Clone the project from the Git repository:

```bash
git clone https://github.com/bowlyz01/pet-care-app.git
cd pet-care-app
```

### Step 2: Install Dependencies

Install the required dependencies:

```bash
npm install
```

### Step 3: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. In the project directory, create a new folder named `config`.
3. Inside the `config` folder, create a file named `firebase.js`.
4. Create a Web App in Firebase and copy the Firebase configuration.
5. Paste the configuration inside `firebase.js` as follows:
   
   ```javascript
   import { initializeApp } from "firebase/app";
   
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   
   const app = initializeApp(firebaseConfig);
   export default app;
   ```

### Step 4: Enable Firebase Authentication

1. In the Firebase Console, go to **Authentication**.
2. Click **Sign-in method** and enable **Email/Password** authentication.

### Step 5: Set Up Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Geolocation API
   - Directions API
   - Routes API
4. Get the API Key and add it to `app.json`:
   
   ```json
   "extra": {
     "googleApiKey": "YOUR_GOOGLE_API_KEY"
   }
   ```

### Step 6: Start the Project

Run the following command to start the app:

```bash
npm run start
```

## Additional Notes

- To run the app on a real device, install the [Expo Go](https://expo.dev/client) app on your phone.
- For iOS development, you need a Mac with Xcode installed.
- If you encounter any issues, check the logs and verify that all dependencies are installed correctly.



