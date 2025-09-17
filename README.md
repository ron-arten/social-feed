
# Social Feed App

Expo React Native application for testing the Pendo installation. 
Expo was chosen for the sake of quick testing of components on your own device using the Expo Go application
You can use EAS build to create your own APK or IPA file to sideload into your physical device
The trade off is Pendo usage requires EAS build or running the application in development mode


### Deeplinking is available in the applcaiton: 

const linking = {
  prefixes: ['socialfeed://'],
  config: {
    screens: {
      Main: {
        screens: {
          Feed: 'feed',
          Friends: 'friends',
          Messages: 'messages',
        },
      },
    },
  },
};

For exmaple: 'socialfeed://friends' to link to the friends page

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher) - **Required minimum version**
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g @expo/cli`)
- [Git](https://git-scm.com/)

### Platform-specific Requirements

**For iOS Development:**
- macOS with Xcode 14.0 or higher
- iOS Simulator or physical iOS device
- CocoaPods (install with `sudo gem install cocoapods`)

**For Android Development:**
- Android Studio with Android SDK
- Android Emulator or physical Android device
- Java Development Kit (JDK) 17 or higher

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ron-arten/social-feed.git
cd social-feed
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Pendo Schemes (Required before first build)
Update the Pendo scheme identifiers in `app.json` so pairing works in your builds:
```json
{
  "expo": {
    "plugins": [
      [
        "rn-pendo-sdk",
        {
          "ios-scheme": "pendo-your-ios-scheme-id",
          "android-scheme": "pendo-your-android-scheme-id"
        }
      ]
    ]
  }
}
```

> Replace the placeholder values with your actual scheme IDs before running any build.

### 4. Create Environment Configuration
Create a `.env` file in the root directory and add your Pendo API key:
```bash
# .env
PENDO_API_KEY=your-actual-pendo-api-key-here
```

> **Important:** Replace `your-actual-pendo-api-key-here` with your actual Pendo API key.

> **Native Folders Note:** The `ios/` and `android/` folders are not tracked in Git. They will be generated on your first platform run. Do not commit these folders.

### 5. Platform Setup

#### iOS Setup
1. Generate the iOS project (first time only):
   ```bash
   npm run ios
   ```
   This creates `ios/` and runs CocoaPods automatically.

2. If CocoaPods did not run or failed, install manually:
   ```bash
   cd ios
   pod install
   cd ..
   ```

#### Android Setup
1. Ensure you have Android Studio installed and configured
2. Open Android Studio and install required SDK components
3. Set up an Android emulator or connect a physical device
4. Generate the Android project (first time only):
   ```bash
   npm run android
   ```

### 6. Build and Run

> **Note:** This app uses Expo development builds with Pendo integration. Standard Expo Go will NOT work properly due to native dependencies.

#### For iOS:
```bash
npm run ios
```

#### For Android:
```bash
npm run android
```

### 7. Using Expo Go for Testing (Limited)
While the app includes native dependencies that require development builds, you can still test basic functionality with Expo Go:

```bash
npx expo start
```

Then scan the QR code with the Expo Go app. Note that Pendo analytics will not function in this mode.



## Configuration

### Pendo Scheme Configuration

To update the Pendo scheme identifiers for pairing:

1. **iOS Scheme**: Update in `app.json`
   ```json
   {
     "expo": {
       "plugins": [
         [
           "rn-pendo-sdk",
           {
             "ios-scheme": "pendo-your-ios-scheme-id",
             "android-scheme": "pendo-your-android-scheme-id"
           }
         ]
       ]
     }
   }
   ```

2. **Android Scheme**: Same location as iOS in `app.json`

### Bundle Identifiers

- **iOS**: Update `bundleIdentifier` in `app.json` under `expo.ios.bundleIdentifier`
- **Android**: Update `package` in `app.json` under `expo.android.package`

eg. com.NAME_HERE.socialfeedapp

## Available Scripts

- `npm start` - Start Expo development server with dev client
- `npm run ios` - Build and run on iOS simulator/device
- `npm run android` - Build and run on Android emulator/device
- `npm run clean` - Clean all build artifacts and reinstall dependencies

## Building with EAS (Expo Application Services) MUST FOLLOW PREVIOUS STEPS BEFORE DOING THIS

To create production-ready builds or test Pendo functionality on physical devices, you'll need to use EAS Build with your own Expo account.

### 1. Set Up Your Expo Account

1. **Create an Expo Account**: Visit [expo.dev](https://expo.dev) and sign up for a free account
2. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```
3. **Login to your account**:
   ```bash
   eas login
   ```

### 2. Configure the Project for Your Account

1. **Update the project configuration** in `app.json`:
   ```json
   {
     "expo": {
       "name": "social-feed-app",
       "slug": "your-unique-project-slug",
       "owner": "your-expo-username",
       "version": "1.1.0"
     }
   }
   ```

2. **Initialize EAS configuration**:
   ```bash
   eas build:configure
   ```
   This creates an `eas.json` file with build profiles.

### 3. Update Bundle Identifiers (Important)

Before building, update the bundle identifiers to avoid conflicts:

1. **iOS Bundle ID** in `app.json`:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourdomain.socialfeedapp"
       }
     }
   }
   ```

2. **Android Package Name** in `app.json`:
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourdomain.socialfeedapp"
       }
     }
   }
   ```

### 4. Build for Different Platforms

#### Development Builds (Recommended for Testing) -- Most Likely you will use this
```bash
# iOS development build
eas build --platform ios --profile development

# Android development build  
eas build --platform android --profile development
```

#### Production Builds
```bash
# iOS production build (requires Apple Developer account)
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production
```

### 5. Install and Test

1. **Development builds**: Install the generated `.ipa` or `.apk` file on your device
2. **Start the development server**: Run `npx expo start --dev-client`
3. **Connect**: Open the development build app and connect to your development server

### 6. EAS Build Configuration Options

Your `eas.json` file will look like this:
```json
{
  "cli": {
    "version": ">= 8.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 7. Important Notes for EAS Build

- **Apple Developer Account**: Required for iOS production builds
- **Google Play Console**: Required for Android production builds and upload
- **Build Limits**: Free Expo accounts have monthly build limits
- **Environment Variables**: Set `PENDO_API_KEY` in EAS secrets:
  ```bash
  eas secret:create --scope project --name PENDO_API_KEY --value your-actual-api-key
  ```

### 8. Alternative: Local Development

If you prefer not to use EAS Build, you can still run development builds locally:
```bash
# This creates local development builds
npx expo run:ios
npx expo run:android
```

## Troubleshooting

### Common Issues

1. **"PENDO_API_KEY is not defined" Error:**
   - Ensure you've created a `.env` file in the root directory
   - Verify the API key is correctly set without quotes or extra spaces
   - Restart the development server after adding the environment variable

2. **Pod Installation Issues (iOS):**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Android Build Issues:**
   - Clean and rebuild: `cd android && ./gradlew clean && cd ..`
   - Ensure Android Studio and SDK are properly configured

4. **Metro/Expo Issues:**
   ```bash
   npx expo start --clear
   # or
   npm run clean
   ```

5. **Node Version Issues:**
   - Use Node Version Manager (nvm) to ensure you're using Node 18+
   ```bash
   nvm use 18 (or higher)
   nvm install 18 (or higher)
   ```

### Development Build vs Expo Go

This app requires **development builds** for full functionality due to:
- Pendo SDK native dependencies
- Custom native configurations
- Enhanced performance features

Expo Go can be used for basic UI testing but will not include Pendo analytics or other native features.

## Dependencies

### Core Dependencies
- **React Native** (0.79.2) - Mobile app framework
- **Expo** (53.0.9) - Development platform and tools
- **React Navigation** - Navigation library
- **Pendo SDK** (rn-pendo-sdk) - Analytics and user feedback
- **Expo SQLite** - Local database
- **React Native Reanimated** - Advanced animations


## Making edits to the original repository

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

