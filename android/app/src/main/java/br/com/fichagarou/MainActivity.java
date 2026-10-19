package br.com.fichagarou;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.webkit.*;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class MainActivity extends Activity {
 private WebView web;
 private SharedPreferences prefs;
 private String pendingExport;
 private static final String HOST = "appassets.androidplatform.net";
 private static final int EXPORT = 101, IMPORT = 102;
 private OnBackInvokedCallback backCallback;

 @Override public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  prefs = getSharedPreferences("ficha-garou", MODE_PRIVATE);
  getWindow().setStatusBarColor(Color.rgb(24,25,27));
  getWindow().setNavigationBarColor(Color.rgb(34,36,39));
  getWindow().getDecorView().setSystemUiVisibility(0);
  FrameLayout root = new FrameLayout(this);
  root.setBackgroundColor(Color.rgb(24,25,27));
  root.setFitsSystemWindows(true);
  web = new WebView(this);
  web.setBackgroundColor(Color.rgb(24,25,27));
  WebSettings settings = web.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);
  settings.setAllowContentAccess(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  settings.setMediaPlaybackRequiresUserGesture(true);
  WebView.setWebContentsDebuggingEnabled(true);
  web.addJavascriptInterface(new Bridge(), "Android");
  web.setWebChromeClient(new WebChromeClient() {
   @Override public boolean onConsoleMessage(ConsoleMessage m) { Log.i("FichaGarou", m.messageLevel()+": "+m.message()+" ["+m.lineNumber()+"]"); return true; }
  });
  web.setWebViewClient(new WebViewClient() {
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return !isLocal(request.getUrl()); }
   @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
    Uri uri = request.getUrl();
    if (!isLocal(uri)) return blocked();
    String path = uri.getPath();
    if (path == null || !path.startsWith("/assets/web/") || path.contains("..")) return blocked();
    String file = path.substring("/assets/".length());
    String mime = file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".svg") ? "image/svg+xml" : file.endsWith(".png") ? "image/png" : "text/html";
    try { return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'"),getAssets().open(file)); }
    catch (IOException ex) { return blocked(); }
   }
  });
  root.addView(web,new FrameLayout.LayoutParams(-1,-1));
  setContentView(root);
  if(Build.VERSION.SDK_INT>=33){backCallback=()->handleBack();getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT,backCallback);}
  web.loadUrl("https://"+HOST+"/assets/web/index.html");
 }
 private boolean isLocal(Uri uri) { return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost()); }
 private WebResourceResponse blocked() { return new WebResourceResponse("text/plain","UTF-8",403,"Forbidden",null,new ByteArrayInputStream(new byte[0])); }
 private void feedback(String message) { runOnUiThread(() -> web.evaluateJavascript("window.nativeFeedback && window.nativeFeedback("+JSONObject.quote(message)+")",null)); }

 private class Bridge {
  @JavascriptInterface public String loadData() { return prefs.getString("data",""); }
  @JavascriptInterface public String loadPreferences() { return prefs.getString("preferences","{}"); }
  @JavascriptInterface public boolean savePreferences(String value) {
   if(value==null||value.length()>10000)return false;
   try{new JSONObject(value);return prefs.edit().putString("preferences",value).commit();}catch(Exception ex){return false;}
  }
  @JavascriptInterface public boolean saveData(String value) {
   if (value == null || value.length() > 10000000) return false;
   try { JSONObject data = new JSONObject(value); if (!"ficha-garou".equals(data.optString("format"))) return false; return prefs.edit().putString("data",value).commit(); }
   catch (Exception e) { return false; }
  }
  @JavascriptInterface public void exportBackup(String json,String name) {
   if (json == null || json.length() > 10000000) { feedback("Backup muito grande."); return; }
   runOnUiThread(() -> {
    pendingExport = json;
    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType("application/json");
    intent.putExtra(Intent.EXTRA_TITLE,name);
    try { startActivityForResult(intent,EXPORT); } catch (Exception ex) { pendingExport=null; feedback("Não foi possível abrir o seletor de arquivos."); }
   });
  }
  @JavascriptInterface public void importBackup() {
   runOnUiThread(() -> {
    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType("*/*");
    intent.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/json","text/plain","application/octet-stream"});
    try { startActivityForResult(intent,IMPORT); } catch (Exception ex) { feedback("Não foi possível abrir o seletor de arquivos."); }
   });
  }
 }
 @Override protected void onActivityResult(int request,int result,Intent data) {
  super.onActivityResult(request,result,data);
  if (result != RESULT_OK || data == null || data.getData() == null) { if(request==EXPORT)pendingExport=null; return; }
  final Uri uri=data.getData();
  if(request==EXPORT && pendingExport!=null) {
   final String content=pendingExport; pendingExport=null;
   new Thread(() -> { try(OutputStream stream=getContentResolver().openOutputStream(uri,"wt")) { if(stream==null)throw new IOException();stream.write(content.getBytes(StandardCharsets.UTF_8));feedback("Backup salvo."); } catch(Exception ex) { feedback("Não foi possível salvar o backup."); } }).start();
  } else if(request==IMPORT) {
   new Thread(() -> { try(InputStream stream=getContentResolver().openInputStream(uri);ByteArrayOutputStream buffer=new ByteArrayOutputStream()) {
    if(stream==null)throw new IOException();byte[] chunk=new byte[8192];int count;
    while((count=stream.read(chunk))!=-1) { buffer.write(chunk,0,count);if(buffer.size()>10000000)throw new IOException("size"); }
    String json=new String(buffer.toByteArray(),StandardCharsets.UTF_8);
    runOnUiThread(() -> web.evaluateJavascript("window.receiveBackup("+JSONObject.quote(json)+")",null));
   } catch(Exception ex) { feedback("Arquivo inválido ou maior que 10 MB."); } }).start();
  }
 }
 private void handleBack() { web.evaluateJavascript("window.appBack ? window.appBack() : false",result -> { if(!"true".equals(result))finish(); }); }
 @Override public void onBackPressed() { handleBack(); }
 @Override protected void onDestroy() { if(Build.VERSION.SDK_INT>=33&&backCallback!=null)getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backCallback);if(web!=null){web.removeJavascriptInterface("Android");web.destroy();}super.onDestroy(); }
}
