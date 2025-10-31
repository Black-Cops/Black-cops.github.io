# WhatsApp-Style React Native Chat & Calling Application

A comprehensive, production-ready WhatsApp-style chat and video calling application built with React Native, Firebase, and WebRTC.

## 🎯 Features

### Authentication & Profile Management
- **Login/Signup**: Email-based authentication with Firebase Auth
- **Profile Setup**: Username, bio, profile photo with custom avatars
- **Auto-Login**: Credentials saved in AsyncStorage for seamless experience
- **Presence Management**: Real-time online/offline status

### Home Screen / Chat List
- **User List**: All registered users displayed with avatars and usernames
- **Message Preview**: Last message shown with bold styling for unread messages
- **Smart Timestamps**: 
  - Time in 12-hour format ("2:32 at night", "10:36 in the evening", "3:26 in the afternoon")
  - Date labels ("Today", "Yesterday", weekday names, full dates)
- **Call Status Indicators**: Visual badges for missed/received/outgoing calls
- **Unread Badges**: Count of unread messages per chat
- **Online Indicators**: Green dot for online users
- **Search Functionality**: Real-time search across chats

### Chat Screen / Conversation View
- **WhatsApp-Style UI**: Dark theme with accurate bubble styling
- **Message Features**:
  - Sender/receiver bubble coloring (green for own messages, gray for others)
  - Message timestamps below each bubble
  - Triple-status system:
    - Single gray tick (sent)
    - Double gray ticks (delivered)
    - Double blue ticks (read)
  - Date separators auto-inserted ("Wednesday", "Monday", etc.)
  - Latest messages always at bottom with auto-scroll
  - Infinite scroll for loading older messages
  
- **Typing Indicator**: Animated "typing..." display when other user is typing

- **Reply Functionality**:
  - Long-press or swipe left to reply
  - Quoted message preview above reply
  - Shows sender context ("You" or username)

- **Emoji Reactions**: 
  - Long-press to react with latest emojis (❤️, 😂, 😮, 😢, 🙏, 👍)
  - Reactions displayed below messages
  - Toggle reactions on/off

- **Message Actions** (Long-press menu):
  - Emoji reactions
  - Reply to message
  - Copy text
  - Delete for self
  - Delete for everyone

- **Jump to Latest**: Button appears when scrolled up

- **Call History in Chat**: Voice/video call logs integrated in message stream

### Voice & Video Calling (WebRTC)
- **P2P Calling**: Peer-to-peer voice and video calls via WebRTC
- **Native Incoming Call UI**:
  - iOS: CallKit integration
  - Android: ConnectionService integration
  - Lock screen notifications with Accept/Decline
- **Call Controls**:
  - Mute/unmute microphone
  - Enable/disable video
  - End call button
  - Call duration timer
- **Call Logs**: Automatically saved in chat history and Firestore
- **Missed Call Indicators**: Visual badges in chat list

### Push Notifications
- **Real-time Notifications**: Even when app is closed/killed
- **Notification Types**:
  - New messages
  - Message replies
  - Emoji reactions
  - Incoming calls
  - Missed calls
- **Native Integration**: Full support for iOS and Android notification systems

### Backend & Data (Firebase Firestore)
- **Real-time Sync**: Instant message and status updates
- **Efficient Queries**: Paginated message loading
- **Data Structure**:
  - Users collection: profiles, presence, stats
  - Chats collection: chat metadata, participants
  - Messages subcollection: body, timestamps, status, reactions, replies
  - Typing subcollection: real-time typing indicators
  - Calls subcollection: call logs and metadata
- **Profile Photos**: Stored as URLs (not in Firebase Storage as requested)

### Additional Features
- **Last Seen**: Timestamp of last activity
- **Multiple Device Support**: Real-time sync across devices
- **Online/Offline Status**: Live presence detection
- **Message Search**: Find messages across chats
- **Performance Optimized**: Fast rendering for large chat histories
- **Error Handling**: Graceful handling of network issues

## 🛠 Tech Stack

- **React Native 0.73.2**: Latest stable version
- **TypeScript**: Type-safe development
- **Firebase**:
  - Authentication
  - Firestore (real-time database)
  - Cloud Messaging (push notifications)
- **React Navigation**: Stack navigation
- **react-native-webrtc**: P2P video/voice calling
- **react-native-callkeep**: Native call UI (iOS/Android)
- **AsyncStorage**: Local data persistence
- **react-native-vector-icons**: Material icons
- **react-native-push-notification**: Local and remote notifications

## 📋 Prerequisites

- Node.js 18+
- React Native development environment set up
  - iOS: Xcode 14+, CocoaPods
  - Android: Android Studio, JDK 11+
- Firebase project with:
  - Authentication enabled (Email/Password)
  - Firestore database created
  - Cloud Messaging configured
- Apple Developer account (for iOS)
- Google Play Developer account (for Android)

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication (Email/Password)
4. Create Firestore database in test/production mode
5. Enable Cloud Messaging

#### iOS Configuration
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `ios/` directory
3. Update `ios/Podfile` if needed

#### Android Configuration
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory
3. Ensure `google-services` plugin is in `android/build.gradle`

### 4. Update Firebase Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
      
      match /typing/{userId} {
        allow read, write: if request.auth != null;
      }
      
      match /calls/{callId} {
        allow read, write: if request.auth != null;
      }
    }
    
    match /callSessions/{callId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🏃 Running the App

### iOS
```bash
npm run ios
```

Or open `ios/WhatsAppChat.xcworkspace` in Xcode and run

### Android
```bash
npm run android
```

Or open `android/` in Android Studio and run

### Development Server
```bash
npm start
```

## 📱 Platform-Specific Setup

### iOS Permissions (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for calls</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to set profile picture</string>
```

### Android Permissions (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## 🎨 UI/UX Features

### Color Scheme (WhatsApp Dark Theme)
- Background: `#0D1117`
- Secondary Background: `#161B22`
- Accent (WhatsApp Green): `#25D366`
- Own Message Bubble: `#005C4B`
- Other Message Bubble: `#1F2937`
- Text Primary: `#E6EDF3`
- Text Secondary: `#8B949E`

### Typography
- System fonts: `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`
- Font weights: 400 (normal), 600 (semibold), 700 (bold)

## 🔧 Configuration Files

### package.json
All required dependencies for React Native, Firebase, WebRTC, and UI libraries

### tsconfig.json
TypeScript configuration for React Native

### babel.config.js
Babel configuration with reanimated plugin

### metro.config.js
Metro bundler configuration

## 📖 Project Structure

```
├── App.tsx                          # Main app entry with navigation
├── index.js                         # React Native entry point
├── src/
│   ├── components/
│   │   ├── ChatListItem.tsx        # Chat list item component
│   │   └── MessageBubble.tsx       # Message bubble component
│   ├── context/
│   │   └── AppContext.tsx          # Global app context (user state)
│   ├── screens/
│   │   ├── LoginScreen.tsx         # Login screen
│   │   ├── SignupScreen.tsx        # Signup screen
│   │   ├── ProfileSetupScreen.tsx  # Profile creation screen
│   │   ├── HomeScreen.tsx          # Chat list screen
│   │   ├── ChatScreen.tsx          # Chat conversation screen
│   │   ├── CallScreen.tsx          # Video/voice call screen
│   │   ├── ProfileScreen.tsx       # User profile screen
│   │   └── SettingsScreen.tsx      # App settings screen
│   ├── services/
│   │   ├── firestoreService.ts     # Firebase Firestore operations
│   │   ├── callService.ts          # WebRTC & CallKeep logic
│   │   └── notificationService.ts  # Push notification setup
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── utils/
│       └── timeUtils.ts            # Time formatting utilities
├── android/                         # Android native code
├── ios/                             # iOS native code
└── firebase.json                    # Firebase configuration
```

## 🐛 Troubleshooting

### Build Errors

**iOS Pod Install Fails**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

**Android Build Fails**
```bash
cd android
./gradlew clean
cd ..
```

### Runtime Errors

**WebRTC Not Working**
- Ensure camera/microphone permissions granted
- Check STUN server connectivity
- Verify Firestore rules allow callSessions collection

**Push Notifications Not Received**
- Verify Firebase Cloud Messaging is enabled
- Check device token registration
- Ensure app has notification permissions

**Messages Not Sending**
- Check Firestore security rules
- Verify user is authenticated
- Check network connectivity

## 🔒 Security Considerations

1. **Firestore Rules**: Implement proper read/write rules
2. **Authentication**: Use Firebase Auth securely
3. **API Keys**: Never commit Firebase config files to public repos
4. **User Privacy**: Implement blocking and reporting features
5. **Media Handling**: Validate uploaded images and files

## 📊 Performance Tips

1. **Message Pagination**: Limit initial message fetch to 50
2. **Image Optimization**: Compress profile photos before upload
3. **Lazy Loading**: Load chat data on demand
4. **Connection Pooling**: Reuse WebRTC connections
5. **Offline Support**: Use Firestore offline persistence

## 🚀 Deployment

### iOS App Store
1. Configure provisioning profiles
2. Set up push notification certificates
3. Build release version
4. Upload to App Store Connect

### Google Play Store
1. Generate signed APK/AAB
2. Configure Firebase Cloud Messaging
3. Set up Google Play Services
4. Upload to Google Play Console

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- WhatsApp for UI/UX inspiration
- Firebase for backend infrastructure
- WebRTC for real-time communication
- React Native community

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for seamless real-time communication**
