document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("products");
  if (!container) return;
  const items = window.MAHAR_PRODUCTS || [];
  if (items.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;">ပစ္စည်းများ မရှိသေးပါ</div>';
    return;
  }
  container.innerHTML = items.map(p => `
    <div style="background:#fff;border-radius:12px;margin:15px;padding:15px;box-shadow:0 4px 10px rgba(0,0,0,0.08);text-align:center;">
      <img src="${p.image}" alt="${p.name}" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;" onerror="this.src='assets/logo.jpeg'">
      <h3 style="margin:10px 0 5px;color:#111;font-size:18px;">${p.name}</h3>
      <p style="color:#c59b27;font-weight:bold;font-size:16px;margin:5px 0;">${Number(p.price).toLocaleString()} Ks</p>
      <p style="color:#666;font-size:13px;margin:5px 0;">${p.color} · ${p.sizes}</p>
      <a href="https://m.me/mahar.yangon.classic.store?text=Order%20${encodeURIComponent(p.name)}" target="_blank" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:bold;">Order on Messenger</a>
    </div>
  `).join('');
});
