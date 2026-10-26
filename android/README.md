# ST. MICHAEL GREAT ACADEMY – OFFICIAL RESULT PORTAL
## Native Android Application (Kotlin + Jetpack Compose)

This is the official student/public native Android application for **St. Michael Great Academy** (Established 2023, Motto: *Learning is fun*).

---

### Project Architecture & Stack
- **Language**: 100% Kotlin
- **UI Framework**: Modern Jetpack Compose with Material 3 Design
- **Architecture**: MVVM (Model-View-ViewModel) with Kotlin Coroutines & StateFlow
- **Networking**: Retrofit 2 + OkHttp 3 with Logging & Gson converter
- **Printing**: Native Android `PrintManager` and `WebView` Print Adapter (generates official A4 PDF result slips)
- **Image Handling**: Coil Compose with official `school_logo.jpg` asset
- **Target SDK**: Android 14 (API 34), Minimum SDK: Android 7.0 (API 24)

---

### Security & Data Protection
- **No Local Data Stubs**: The app directly connects to the school's central live backend portal (`/api/public/verify-result`).
- **No Embedded Admin Passwords**: The app is strictly student-facing. No administrative PINs, passwords, or endpoints are packaged in the app.
- **Single-Use PIN Enforcement**: Verification is handled atomically by the central backend. Once verified, PIN status transitions to `USED`.
- **PIN Privacy**: The student's Result PIN is never rendered on the verified result slip.
- **Offline Guard**: Network status is verified prior to verification calls. Offline state informs the student to reconnect.

---

### How to Open & Build in Android Studio
1. Open **Android Studio** (Koala, Jellyfish, Iguana, Hedgehog, or Flamingo).
2. Select **File > Open** and choose the `android` folder.
3. Allow Gradle to sync dependencies.
4. Select an Android Emulator (API 24+) or physical Android device.
5. Click **Run** (`Shift + F10`) or run from terminal:
   ```bash
   ./gradlew assembleDebug
   ```
   The compiled APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

### Portal Backend Configuration
The app defaults to the school's live Cloud Run result portal:
```
https://ais-pre-yxhtecahnezg43ic3h5omk-29836764747.europe-west2.run.app/
```
The portal URL can also be modified in-app via the top bar Settings gear without rebuilding the application.
