import os
import shutil
import subprocess
import sys

def build_apk():
    print("=== STARTING UPGRADED HIGH-PERFORMANCE ANDROID APK BUILD ===")
    work_dir = "/tmp/apk_builder"
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir)

    os.makedirs(f"{work_dir}/gen", exist_ok=True)
    os.makedirs(f"{work_dir}/bin/classes", exist_ok=True)
    os.makedirs(f"{work_dir}/res/values", exist_ok=True)
    os.makedirs(f"{work_dir}/res/drawable", exist_ok=True)
    os.makedirs(f"{work_dir}/res/drawable-hdpi", exist_ok=True)
    os.makedirs(f"{work_dir}/res/drawable-xhdpi", exist_ok=True)
    os.makedirs(f"{work_dir}/res/drawable-xxhdpi", exist_ok=True)
    os.makedirs(f"{work_dir}/res/layout", exist_ok=True)
    os.makedirs(f"{work_dir}/src/com/stmichael/greatacademy/resultportal", exist_ok=True)

    android_jar = "/usr/lib/android-sdk/platforms/android-23/android.jar"
    if not os.path.exists(android_jar):
        print("ERROR: android.jar not found at", android_jar)
        sys.exit(1)

    # 1. Copy exact school logo
    logo_src = "public/school_logo.jpg"
    shutil.copy(logo_src, f"{work_dir}/res/drawable/school_logo.jpg")
    shutil.copy(logo_src, f"{work_dir}/res/drawable-hdpi/school_logo.jpg")
    shutil.copy(logo_src, f"{work_dir}/res/drawable-xhdpi/school_logo.jpg")
    shutil.copy(logo_src, f"{work_dir}/res/drawable-xxhdpi/school_logo.jpg")

    # 2. Write AndroidManifest.xml with Hardware Acceleration, Large Heap, and Pure Black Theme
    manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.stmichael.greatacademy.resultportal"
    android:versionCode="2"
    android:versionName="1.1.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/school_logo"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:hardwareAccelerated="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
    with open(f"{work_dir}/AndroidManifest.xml", "w") as f:
        f.write(manifest_content)

    # 3. Write strings.xml
    with open(f"{work_dir}/res/values/strings.xml", "w") as f:
        f.write("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">ST. MICHAEL GREAT ACADEMY</string>
    <string name="motto">Learning is fun</string>
</resources>
""")

    # 4. Write activity_main.xml layout (Bold Black Theme #040914, Desktop Bar, Quick Sync & Switch)
    with open(f"{work_dir}/res/layout/activity_main.xml", "w") as f:
        f.write("""<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#060e1d">

    <!-- Top Action Bar (Bold Black & Gold #040914) -->
    <LinearLayout
        android:id="@+id/topBar"
        android:layout_width="match_parent"
        android:layout_height="52dp"
        android:background="#040914"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:paddingLeft="10dp"
        android:paddingRight="10dp">

        <ImageView
            android:id="@+id/logoImage"
            android:layout_width="34dp"
            android:layout_height="34dp"
            android:src="@drawable/school_logo"
            android:contentDescription="School Logo" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical"
            android:paddingLeft="8dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="ST. MICHAEL GREAT ACADEMY"
                android:textColor="#F59E0B"
                android:textSize="12sp"
                android:textStyle="bold"
                android:singleLine="true" />

            <TextView
                android:id="@+id/portalSubtitle"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="OFFICIAL RESULT PORTAL • DESKTOP MODE"
                android:textColor="#94A3B8"
                android:textSize="9sp"
                android:singleLine="true" />
        </LinearLayout>

        <!-- Desktop Mode Indicator / Toggle -->
        <Button
            android:id="@+id/btnViewMode"
            android:layout_width="wrap_content"
            android:layout_height="30dp"
            android:text="DESKTOP: ON"
            android:textColor="#040914"
            android:textSize="9sp"
            android:textStyle="bold"
            android:background="#10B981"
            android:paddingLeft="6dp"
            android:paddingRight="6dp" />

        <!-- Switch Site Button (Dev Site / Published Live Site) -->
        <Button
            android:id="@+id/btnSwitchSite"
            android:layout_width="wrap_content"
            android:layout_height="30dp"
            android:text="SWITCH SITE"
            android:textColor="#040914"
            android:textSize="9sp"
            android:textStyle="bold"
            android:background="#F59E0B"
            android:paddingLeft="6dp"
            android:paddingRight="6dp"
            android:layout_marginLeft="5dp" />

        <!-- Sync / Refresh Button -->
        <Button
            android:id="@+id/btnSync"
            android:layout_width="32dp"
            android:layout_height="30dp"
            android:text="⟳"
            android:textColor="#FFFFFF"
            android:textSize="14sp"
            android:background="#0F172A"
            android:layout_marginLeft="5dp" />

        <!-- Print PDF Button -->
        <Button
            android:id="@+id/btnPrint"
            android:layout_width="32dp"
            android:layout_height="30dp"
            android:text="🖨"
            android:textColor="#FFFFFF"
            android:textSize="13sp"
            android:background="#0F172A"
            android:layout_marginLeft="5dp" />
    </LinearLayout>

    <!-- Gold Accent Divider -->
    <View
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:background="#F59E0B" />

    <!-- Progress Bar -->
    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="3dp"
        android:visibility="gone" />

    <!-- Offline Notification Banner -->
    <TextView
        android:id="@+id/offlineBanner"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="#991B1B"
        android:textColor="#FFFFFF"
        android:textSize="11sp"
        android:gravity="center"
        android:padding="5dp"
        android:text="Internet connection offline. Tap ⟳ to reconnect."
        android:visibility="gone" />

    <!-- Main WebView with Hardware Acceleration & Dark Canvas -->
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:background="#060e1d" />
</LinearLayout>
""")

    # 5. Write MainActivity.java (Desktop User-Agent, Hardware Acceleration, Bold Black Dialogs, Fast Scrolling)
    java_code = """package com.stmichael.greatacademy.resultportal;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {

    public static final String LIVE_URL = "https://ais-pre-yxhtecahnezg43ic3h5omk-29836764747.europe-west2.run.app/";
    public static final String DEV_URL = "https://ais-dev-yxhtecahnezg43ic3h5omk-29836764747.europe-west2.run.app/";

    // Desktop User Agent string (Forces complete desktop layout, exact desktop tables, sidebars, and colors)
    private static final String DESKTOP_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    private static final String MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

    private static final String PREFS_NAME = "SMGA_PORTAL_PREFS";
    private static final String KEY_CURRENT_URL = "current_portal_url";
    private static final String KEY_IS_DESKTOP = "is_desktop_mode";

    private WebView webView;
    private ProgressBar progressBar;
    private TextView offlineBanner;
    private TextView portalSubtitle;
    private Button btnViewMode;
    private Button btnSwitchSite;
    private Button btnSync;
    private Button btnPrint;
    private SharedPreferences prefs;

    private boolean isDesktopMode = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        isDesktopMode = prefs.getBoolean(KEY_IS_DESKTOP, true);

        webView = (WebView) findViewById(R.id.webView);
        progressBar = (ProgressBar) findViewById(R.id.progressBar);
        offlineBanner = (TextView) findViewById(R.id.offlineBanner);
        portalSubtitle = (TextView) findViewById(R.id.portalSubtitle);
        btnViewMode = (Button) findViewById(R.id.btnViewMode);
        btnSwitchSite = (Button) findViewById(R.id.btnSwitchSite);
        btnSync = (Button) findViewById(R.id.btnSync);
        btnPrint = (Button) findViewById(R.id.btnPrint);

        setupHighPerformanceWebView();
        setupControls();

        String targetUrl = getCurrentUrl();
        updateSwitchButtonLabel(targetUrl);
        updateViewModeButton();
        loadPortalUrl(targetUrl);
    }

    private String getCurrentUrl() {
        return prefs.getString(KEY_CURRENT_URL, LIVE_URL);
    }

    private void setCurrentUrl(String url) {
        prefs.edit().putString(KEY_CURRENT_URL, url).apply();
        updateSwitchButtonLabel(url);
    }

    private void updateSwitchButtonLabel(String url) {
        if (url.contains("ais-dev")) {
            btnSwitchSite.setText("DEV SITE");
            btnSwitchSite.setBackgroundColor(0xFF3B82F6); // Blue for dev
            btnSwitchSite.setTextColor(0xFFFFFFFF);
            portalSubtitle.setText("DEV / PREVIEW PORTAL • " + (isDesktopMode ? "DESKTOP MODE" : "MOBILE"));
        } else {
            btnSwitchSite.setText("LIVE SITE");
            btnSwitchSite.setBackgroundColor(0xFFF59E0B); // Amber Gold for live
            btnSwitchSite.setTextColor(0xFF040914);
            portalSubtitle.setText("OFFICIAL RESULT PORTAL • " + (isDesktopMode ? "DESKTOP MODE" : "MOBILE"));
        }
    }

    private void updateViewModeButton() {
        if (isDesktopMode) {
            btnViewMode.setText("DESKTOP: ON");
            btnViewMode.setBackgroundColor(0xFF10B981); // Emerald
            btnViewMode.setTextColor(0xFF040914);
        } else {
            btnViewMode.setText("MOBILE: ON");
            btnViewMode.setBackgroundColor(0xFF64748B); // Slate
            btnViewMode.setTextColor(0xFFFFFFFF);
        }
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkInfo netInfo = cm.getActiveNetworkInfo();
            return netInfo != null && netInfo.isConnected();
        }
        return false;
    }

    private void setupHighPerformanceWebView() {
        // Enforce pure black background to prevent any white flashes
        webView.setBackgroundColor(0xFF060E1D);

        // Hardware-accelerated 60FPS fluid scrolling
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }

        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);

        // Desktop Site viewport configuration
        applyViewportAndUserAgent();

        // Performance & caching
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAppCacheEnabled(true);
        settings.setEnableSmoothTransition(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
                if (!isNetworkAvailable()) {
                    offlineBanner.setVisibility(View.VISIBLE);
                } else {
                    offlineBanner.setVisibility(View.GONE);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (!isNetworkAvailable()) {
                    offlineBanner.setVisibility(View.VISIBLE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });
    }

    private void applyViewportAndUserAgent() {
        WebSettings settings = webView.getSettings();
        if (isDesktopMode) {
            settings.setUserAgentString(DESKTOP_UA);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            webView.setInitialScale(100);
        } else {
            settings.setUserAgentString(MOBILE_UA);
            settings.setUseWideViewPort(false);
            settings.setLoadWithOverviewMode(false);
            webView.setInitialScale(0);
        }
    }

    private void setupControls() {
        // Toggle Desktop View / Mobile View
        btnViewMode.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                isDesktopMode = !isDesktopMode;
                prefs.edit().putBoolean(KEY_IS_DESKTOP, isDesktopMode).apply();
                applyViewportAndUserAgent();
                updateViewModeButton();
                updateSwitchButtonLabel(getCurrentUrl());
                webView.reload();
                Toast.makeText(MainActivity.this, isDesktopMode ? "Desktop Site Activated" : "Mobile Site Activated", Toast.LENGTH_SHORT).show();
            }
        });

        // Switch Site Dialog (Bold Black Theme)
        btnSwitchSite.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showDarkSiteSelectDialog();
            }
        });

        // Instant Sync & Refresh
        btnSync.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!isNetworkAvailable()) {
                    offlineBanner.setVisibility(View.VISIBLE);
                    Toast.makeText(MainActivity.this, "Offline. Connect to internet to sync.", Toast.LENGTH_SHORT).show();
                } else {
                    offlineBanner.setVisibility(View.GONE);
                    Toast.makeText(MainActivity.this, "Syncing database & refreshing portal...", Toast.LENGTH_SHORT).show();
                    webView.clearCache(true);
                    webView.reload();
                }
            }
        });

        // Native Print / PDF
        btnPrint.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                printCurrentPage();
            }
        });
    }

    // Bold Dark Theme Dialog for choosing environment
    private void showDarkSiteSelectDialog() {
        final String[] options = new String[]{
            "★ Live Published Portal (Official Live Site)",
            "⚡ Dev / Preview Site (Instant Testing & Recent Edits)",
            "✎ Enter Custom Portal Address..."
        };

        AlertDialog.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder = new AlertDialog.Builder(this, AlertDialog.THEME_DEVICE_DEFAULT_DARK);
        } else {
            builder = new AlertDialog.Builder(this, AlertDialog.THEME_HOLO_DARK);
        }

        builder.setTitle("Select Portal Environment");
        builder.setItems(options, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                if (which == 0) {
                    setCurrentUrl(LIVE_URL);
                    loadPortalUrl(LIVE_URL);
                    Toast.makeText(MainActivity.this, "Opened Live Published Portal", Toast.LENGTH_SHORT).show();
                } else if (which == 1) {
                    setCurrentUrl(DEV_URL);
                    loadPortalUrl(DEV_URL);
                    Toast.makeText(MainActivity.this, "Opened Dev / Preview Portal", Toast.LENGTH_SHORT).show();
                } else if (which == 2) {
                    showCustomUrlDialog();
                }
            }
        });
        builder.setNegativeButton("Close", null);
        builder.show();
    }

    private void showCustomUrlDialog() {
        final EditText input = new EditText(this);
        input.setHint("https://...");
        input.setText(getCurrentUrl());
        input.setTextColor(0xFFF8FAFC);
        input.setBackgroundColor(0xFF0F172A);

        AlertDialog.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder = new AlertDialog.Builder(this, AlertDialog.THEME_DEVICE_DEFAULT_DARK);
        } else {
            builder = new AlertDialog.Builder(this, AlertDialog.THEME_HOLO_DARK);
        }

        builder.setTitle("Custom School Portal URL");
        builder.setView(input);
        builder.setPositiveButton("Save & Connect", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String newUrl = input.getText().toString().trim();
                if (!newUrl.isEmpty()) {
                    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                        newUrl = "https://" + newUrl;
                    }
                    setCurrentUrl(newUrl);
                    loadPortalUrl(newUrl);
                }
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void loadPortalUrl(String url) {
        if (!isNetworkAvailable()) {
            offlineBanner.setVisibility(View.VISIBLE);
        } else {
            offlineBanner.setVisibility(View.GONE);
        }
        webView.loadUrl(url);
    }

    private void printCurrentPage() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
            if (printManager != null) {
                PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter();
                String jobName = "ST_MICHAEL_RESULT_" + System.currentTimeMillis();
                printManager.print(jobName, printAdapter, new PrintAttributes.Builder().build());
            } else {
                Toast.makeText(this, "Printing is not supported on this device", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"""
    with open(f"{work_dir}/src/com/stmichael/greatacademy/resultportal/MainActivity.java", "w") as f:
        f.write(java_code)

    # 6. Generate R.java & package resources using aapt
    print("Step 1: Running aapt package to generate R.java and resources.ap_...")
    cmd_aapt = [
        "aapt", "package", "-f", "-m",
        "-J", f"{work_dir}/gen",
        "-M", f"{work_dir}/AndroidManifest.xml",
        "-S", f"{work_dir}/res",
        "-I", android_jar,
        "-F", f"{work_dir}/bin/resources.ap_"
    ]
    res = subprocess.run(cmd_aapt, capture_output=True, text=True)
    if res.returncode != 0:
        print("aapt failed:", res.stderr)
        sys.exit(1)
    print("aapt package succeeded.")

    # 7. Compile Java files
    print("Step 2: Compiling Java source files with javac...")
    r_java = f"{work_dir}/gen/com/stmichael/greatacademy/resultportal/R.java"
    main_java = f"{work_dir}/src/com/stmichael/greatacademy/resultportal/MainActivity.java"

    cmd_javac = [
        "javac",
        "-source", "8",
        "-target", "8",
        "-bootclasspath", android_jar,
        "-cp", f"{work_dir}/bin/classes",
        "-d", f"{work_dir}/bin/classes",
        r_java, main_java
    ]
    res = subprocess.run(cmd_javac, capture_output=True, text=True)
    if res.returncode != 0:
        print("javac failed:", res.stderr)
        sys.exit(1)
    print("javac compilation succeeded.")

    # 8. Convert class files to Dalvik bytecode (classes.dex) using dalvik-exchange (dx)
    print("Step 3: Creating classes.dex using dalvik-exchange...")
    cmd_dx = [
        "dalvik-exchange",
        "--dex",
        f"--output={work_dir}/bin/classes.dex",
        f"{work_dir}/bin/classes"
    ]
    res = subprocess.run(cmd_dx, capture_output=True, text=True)
    if res.returncode != 0:
        print("dx failed:", res.stderr)
        sys.exit(1)
    print("classes.dex generated successfully.")

    # 9. Assemble unsigned APK
    print("Step 4: Assembling APK...")
    unsigned_apk = f"{work_dir}/bin/app.unsigned.apk"
    shutil.copy(f"{work_dir}/bin/resources.ap_", unsigned_apk)

    cmd_add = ["aapt", "add", unsigned_apk, "classes.dex"]
    res = subprocess.run(cmd_add, cwd=f"{work_dir}/bin", capture_output=True, text=True)
    if res.returncode != 0:
        print("aapt add failed:", res.stderr)
        sys.exit(1)
    print("Added classes.dex to APK.")

    # 10. Sign APK with permanent release keystore
    print("Step 5: Signing APK with permanent keystore...")
    keystore_path = "scripts/school_release.keystore"
    if not os.path.exists(keystore_path):
        cmd_keytool = [
            "keytool", "-genkeypair",
            "-validity", "20000",
            "-dname", "CN=StMichaelGreatAcademy, O=School, C=NG",
            "-keystore", keystore_path,
            "-storepass", "stmichael2026",
            "-keypass", "stmichael2026",
            "-alias", "stmichael",
            "-keyalg", "RSA",
            "-keysize", "2048"
        ]
        res = subprocess.run(cmd_keytool, capture_output=True, text=True)
        if res.returncode != 0:
            print("keytool failed:", res.stderr)
            sys.exit(1)

    cmd_jarsigner = [
        "jarsigner",
        "-sigalg", "SHA256withRSA",
        "-digestalg", "SHA-256",
        "-keystore", keystore_path,
        "-storepass", "stmichael2026",
        "-keypass", "stmichael2026",
        unsigned_apk,
        "stmichael"
    ]
    res = subprocess.run(cmd_jarsigner, capture_output=True, text=True)
    if res.returncode != 0:
        print("jarsigner failed:", res.stderr)
        sys.exit(1)
    print("APK signed successfully with permanent certificate.")

    # 11. Run zipalign to optimize APK alignment
    print("Step 6: Running zipalign...")
    os.makedirs("public/downloads", exist_ok=True)
    final_apk = "public/downloads/StMichaelGreatAcademy.apk"
    if os.path.exists(final_apk):
        os.remove(final_apk)

    cmd_zipalign = ["zipalign", "-f", "4", unsigned_apk, final_apk]
    res = subprocess.run(cmd_zipalign, capture_output=True, text=True)
    if res.returncode != 0:
        print("zipalign failed, copying signed apk directly:", res.stderr)
        shutil.copy(unsigned_apk, final_apk)
    else:
        print("zipalign succeeded.")

    apk_size = os.path.getsize(final_apk)
    print(f"=== UPGRADED APK BUILD COMPLETE! ===")
    print(f"File: {final_apk}")
    print(f"Size: {apk_size} bytes ({round(apk_size / 1024, 1)} KB)")

if __name__ == "__main__":
    build_apk()
