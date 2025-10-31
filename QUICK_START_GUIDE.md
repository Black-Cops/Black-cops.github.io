# Quick Start Guide - WhatsApp-Style Chat App

## ⚡ 5-Minute Setup

### Prerequisites Check
- ✅ Node.js 18+ installed
- ✅ React Native environment ready (Xcode for iOS, Android Studio for Android)
- ✅ Firebase account (free tier works)

### Step 1: Firebase Setup (3 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project (or use existing)
3. Enable these services:
   - **Authentication** → Email/Password
   - **Firestore Database** → Create database (start in test mode)
   - **Cloud Messaging** → Enable

### Step 2: Add Your App to Firebase

#### For iOS:
1. Click "Add iOS app"
2. Bundle ID: `com.whatsappchat` (or your choice)
3. Download `GoogleService-Info.plist`
4. Place in `ios/` directory

#### For Android:
1. Click "Add Android app"
2. Package name: `com.whatsappchat` (or your choice)
3. Download `google-services.json`
4. Place in `android/app/` directory

### Step 3: Install Dependencies

```bash
# Install npm packages
npm install

# iOS only - install pods
cd ios && pod install && cd ..
```

### Step 4: Firestore Security Rules

Go to Firestore → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
    match /callSessions/{callId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click "Publish"

### Step 5: Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## 🎉 That's It!

The app should now launch. You can:
1. Sign up with email/password
2. Set up your profile
3. See the home screen

## 🔧 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### iOS build fails
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Android build fails
```bash
cd android
./gradlew clean
cd ..
```

### Firebase not working
- Check `GoogleService-Info.plist` is in `ios/`
- Check `google-services.json` is in `android/app/`
- Verify package name/bundle ID matches Firebase console

## 📱 Testing Calls

For video/voice calling:
- Need 2 physical devices (or 1 device + 1 simulator)
- Both must be signed in with different accounts
- Test on same WiFi network first

## 📚 More Info

See `RN_WHATSAPP_README.md` for:
- Detailed configuration
- Advanced features
- Production deployment
- API documentation

## 🆘 Need Help?

1. Check Firebase console for errors
2. Check terminal logs for build errors
3. Verify Firestore rules are published
4. Ensure permissions are granted (camera, microphone)

---

**Quick tip**: To test chat without calling features, just sign up 2 accounts and start messaging!
