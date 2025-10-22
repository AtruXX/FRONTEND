# Firebase Setup for AtruXMobileVers

Follow the steps below to finish configuring Firebase so you can distribute Android test builds via Firebase App Distribution.

## 1. Create & Configure the Firebase Project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a project (or reuse an existing one).
2. Add an Android app with the package name `com.atrux.atruxmobilevers`.
3. Download the generated `google-services.json` file and replace `android/app/google-services.json` with it.
4. If you plan to support iOS, also add an iOS app with the bundle id `com.atrux.AtruXMobileVers` and replace `ios/GoogleService-Info.plist`.

## 2. Update the Expo Config

Open `app.json` and update the values under `expo.extra.firebase` with the real credentials from the Firebase console. These are used to initialise the JS SDK at runtime.

## 3. Provide App Distribution Credentials

1. Create a service account with the **Firebase App Distribution Admin** role and download the JSON key.
2. Save the file somewhere outside the repository (for example `Mobile/firebase-service-account.json`) and **do not commit it**.
3. Edit `android/gradle.properties` and set:

```
firebaseAppDistributionEnabled=true
firebaseAppDistributionAppId=YOUR_FIREBASE_ANDROID_APP_ID
firebaseAppDistributionCredentialsFile=/absolute/path/to/firebase-service-account.json
# Optional:
# firebaseAppDistributionGroups=qa-testers
# firebaseAppDistributionTesters=tester1@example.com,tester2@example.com
```

The `firebaseAppDistributionAppId` is the `mobilesdk_app_id` from `google-services.json`.

## 4. Upload a Build for Testing

1. Make sure you are logged in to Expo and have run `npm install`.
2. Create a release build: `expo run:android --variant release`.
3. Distribute it through Firebase:

```
cd android
./gradlew appDistributionUploadRelease
```

You can also pass release notes or target groups at runtime:

```
./gradlew appDistributionUploadRelease \
  -PfirebaseAppDistributionReleaseNotesFile=../release-notes.txt \
  -PfirebaseAppDistributionGroups=qa-testers
```

The Gradle task is only enabled when `firebaseAppDistributionEnabled=true`, so local builds continue to work even without Firebase credentials.

## 5. Optional: CI Environment Variables

When running in CI, set the Gradle properties via environment variables instead of editing `gradle.properties`:

```
export FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json
./gradlew appDistributionUploadRelease \
  -PfirebaseAppDistributionEnabled=true \
  -PfirebaseAppDistributionAppId=1:1234567890:android:abcdef \
  -PfirebaseAppDistributionCredentialsFile=$FIREBASE_SERVICE_ACCOUNT
```

## 6. Verify the Integration

- `expo run:android` should succeed locally after replacing the placeholder configuration files.
- `./gradlew appDistributionUploadRelease` should upload a build that appears in the Firebase console under **App Distribution**.

If you run into issues, double-check that all placeholder values have been replaced and that the service account JSON is readable by Gradle (especially in CI environments).
