package com.mahar.yangon.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends Activity {

    private WebView web;

    @Override
    public void onCreate(Bundle b) {
        super.onCreate(b);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setSupportZoom(false);

        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());

        boolean isAdmin =
                getPackageName().equals("com.mahar.yangon.app.admin");

        if (isAdmin) {
            web.loadUrl(
                "https://billionairenasss-debug.github.io/Mahar-yangon-app/admin.html"
            );
        } else {
            web.loadUrl(
                "https://billionairenasss-debug.github.io/Mahar-yangon-app/"
            );
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
