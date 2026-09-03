# မဟာရန်ကုန် Classic Store — Android App

Android app project for Mahar Yangon Classic Store, using the existing Supabase backend and shop UI.

## Build APK from GitHub (phone-friendly)
1. Upload the **contents of this folder** to the root of a GitHub repository (do not upload the ZIP itself).
2. Open the repository's **Actions** tab.
3. Select **Build Mahar Yangon APK**.
4. Tap **Run workflow** and run it on the default branch.
5. When the run finishes, open the run and download the **mahar-yangon-apk** artifact. It contains `app-debug.apk`.

The included GitHub Actions workflow installs Java 17 and Gradle 8.7 automatically, so Android Studio is not required just to build the debug APK.

## App
The app launches `index.html` from Android assets and uses the Supabase publishable key in `app/src/main/assets/config.js`.

Never put a Supabase secret/service-role key in the app.
