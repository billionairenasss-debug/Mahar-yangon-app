package com.mahar.yangon.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends Activity {
  private WebView web;
  @Override public void onCreate(Bundle b){ super.onCreate(b); web=new WebView(this); setContentView(web);
    WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setAllowUniversalAccessFromFileURLs(true); s.setMediaPlaybackRequiresUserGesture(false);
    web.setWebViewClient(new WebViewClient(){ @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){ String u=r.getUrl().toString(); if(u.startsWith("https://")||u.startsWith("http://")||u.startsWith("tel:")||u.startsWith("sms:")){ try{ startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(u))); }catch(Exception ignored){} return true;} return false; }});
    web.setWebChromeClient(new WebChromeClient()); web.loadUrl("https://billionairenasss-debug.github.io/Mahar-yangon-app/");
  }
  @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
