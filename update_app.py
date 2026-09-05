import re

# 1. Update AndroidManifest to allow cleartext
with open('app/src/main/AndroidManifest.xml', 'r', encoding='utf-8') as f:
    manifest = f.read()
manifest = manifest.replace('android:usesCleartextTraffic="false"', 'android:usesCleartextTraffic="true"')
with open('app/src/main/AndroidManifest.xml', 'w', encoding='utf-8') as f:
    f.write(manifest)

# 2. Update index.html
with open('app/src/main/assets/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace supabase script with products.js
if 'products.js' not in html:
    html = html.replace('<script src="config.js"></script>', '<script src="config.js"></script>\n<script src="products.js"></script>')

# Replace image paths in products.js to point to current directory
with open('app/src/main/assets/products.js', 'r', encoding='utf-8') as f:
    pjs = f.read()
pjs = pjs.replace('image:"products/', 'image:"')
with open('app/src/main/assets/products.js', 'w', encoding='utf-8') as f:
    f.write(pjs)

# Fallback mechanism in index.html for loading products
fallback_code = """
async function loadProducts(){
  const container = document.getElementById('products');
  function renderItems(items){
    if(!container) return;
    if(!items || items.length === 0){
      container.innerHTML = '<div class="empty">ပစ္စည်းများ မရှိသေးပါ</div>';
      return;
    }
    container.innerHTML = items.map(p => `
      <div class="card">
        <img src="${p.image_url || p.image || 'assets/logo.jpeg'}" alt="${p.name || ''}" onerror="this.src='assets/logo.jpeg'">
        <div class="info">
          <h3>${p.name || ''}</h3>
          <p class="price">${(p.price || 0).toLocaleString()} Ks</p>
          <small>${p.color || ''} · ${p.sizes || ''}</small>
          <a class="order-btn" href="https://m.me/mahar.yangon.classic.store?text=Order%20${encodeURIComponent(p.name || '')}" target="_blank">Order on Messenger</a>
        </div>
      </div>
    `).join('');
  }

  // If local products exist, render them first immediately
  if(window.MAHAR_PRODUCTS && window.MAHAR_PRODUCTS.length > 0){
    renderItems(window.MAHAR_PRODUCTS);
  }

  // Then try Supabase if available
  try {
    if(typeof supabase !== 'undefined' && window.MAHAR_CONFIG){
      const client = supabase.createClient(window.MAHAR_CONFIG.SUPABASE_URL, window.MAHAR_CONFIG.SUPABASE_PUBLISHABLE_KEY);
      const { data, error } = await client.from('products').select('*').eq('active', true).order('created_at', { ascending: false });
      if(!error && data && data.length > 0){
        renderItems(data);
      }
    }
  } catch(e) {
    console.log("Using offline local data:", e);
  }
}
loadProducts();
"""

html = re.sub(r'async function loadProducts\(\)\{[\s\S]*?\}', fallback_code, html)
with open('app/src/main/assets/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: Code updated successfully!")
