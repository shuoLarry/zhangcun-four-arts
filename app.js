/* 章村四艺 — no analytics, no remote runtime dependencies. */
(() => {
  'use strict';
  const ROOT = new URL('.', document.currentScript.src);
  const ARTS = [
    { id: 'shezhi', name: '畲织' }, { id: 'zhubian', name: '竹编' },
    { id: 'sunkehua', name: '笋壳画' }, { id: 'shexiang', name: '畲香' }
  ];
  const STORAGE_KEY = 'zhangcun-four-arts-stories-v1';
  const $ = selector => document.querySelector(selector);
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
  }
  function savedStories() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(stored) ? stored.filter(id => ARTS.some(a => a.id === id)) : [];
    } catch { return []; }
  }
  function refreshCollection() {
    const saved = savedStories();
    document.querySelectorAll('[data-stamp]').forEach(el => {
      const collected = saved.includes(el.dataset.stamp);
      const art = ARTS.find(a => a.id === el.dataset.stamp);
      el.classList.toggle('collected', collected);
      el.setAttribute('aria-label', `${art.name}故事，${collected ? '已收藏' : '未收藏，前往阅读'}`);
    });
    const count = $('#collection-count');
    if (count) count.textContent = `${saved.length} / 4`;
    const button = $('[data-collect]');
    if (button) {
      const has = saved.includes(button.dataset.collect);
      button.setAttribute('aria-pressed', String(has));
      button.querySelector('span').textContent = has ? '已收入故事册' : '收入我的故事册';
    }
  }
  refreshCollection();
  window.addEventListener('storage', refreshCollection);
  $('[data-collect]')?.addEventListener('click', event => {
    const id = event.currentTarget.dataset.collect;
    const saved = savedStories();
    if (saved.includes(id)) { toast('这段故事已在你的故事册里'); return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved, id]));
      refreshCollection();
      toast(saved.length === 3 ? '四艺已集齐，章村的故事陪你回家' : '已收入故事册，回到主页可以查看');
    } catch { toast('当前浏览器无法保存，请允许本地存储后再试'); }
  });
  $('.nav-toggle')?.addEventListener('click', event => {
    const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.textContent = open ? '收起菜单 −' : '菜单 ＋';
    $('#main-nav').classList.toggle('open', open);
  });
  document.querySelectorAll('#main-nav a').forEach(link => link.addEventListener('click', () => {
    $('#main-nav').classList.remove('open');
    $('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    if ($('.nav-toggle')) $('.nav-toggle').textContent = '菜单 ＋';
  }));
  const progress = $('.story-progress');
  if (progress) {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${height > 0 ? Math.min(100, scrollY / height * 100) : 0}%`;
    };
    addEventListener('scroll', updateProgress, { passive: true });
    addEventListener('resize', updateProgress);
    updateProgress();
  }
  function isPublicURL(url) {
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && !url.username && !url.password &&
      !url.search && !url.hash && host.includes('.') && !host.endsWith('.local') &&
      !host.endsWith('.localhost') && !/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) && !host.includes(':');
  }
  function qrFor(url) {
    const qr = qrcode(0, 'M');
    qr.addData(url.href);
    qr.make();
    return qr;
  }
  function qrSVG(qr, id, label) {
    return qr.createSvgTag({ cellSize: 8, margin: 32, scalable: true,
      alt: { text: label, id: `qr-${id}-description` },
      title: { text: label, id: `qr-${id}-title` }
    });
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const field = document.createElement('textarea');
      field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.append(field); field.select();
      const success = document.execCommand('copy'); field.remove();
      if (!success) throw new Error('Copy unavailable');
    }
  }
  const dialog = $('#share-dialog');
  const storyId = document.body.dataset.story;
  if (dialog && storyId) {
    const art = ARTS.find(a => a.id === storyId);
    const url = new URL(`stories/${storyId}.html`, ROOT);
    $('[data-share]')?.addEventListener('click', () => {
      const box = $('#share-qr');
      if (isPublicURL(ROOT)) box.innerHTML = qrSVG(qrFor(url), 'share', `${art.name}故事二维码`);
      else box.innerHTML = '<p class="qr-placeholder">当前为本地预览。正式发布后，这里会显示可分享的故事二维码。</p>';
      $('#share-address').textContent = isPublicURL(ROOT) ? url.href : '可以先使用二维码制作页，为正式网址制作故事卡。';
      $('#copy-story-link').disabled = !isPublicURL(ROOT);
      dialog.showModal();
    });
    $('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    } });
    $('#copy-story-link').addEventListener('click', async () => {
      try { await copyText(url.href); toast('故事链接已复制'); }
      catch { toast('复制未成功，请长按上方网址复制'); }
    });
  }
  const qrForm = $('#qr-form');
  if (qrForm) {
    let currentBase = null;
    const generated = new Map();
    const input = $('#site-address');
    const status = $('#qr-status');
    function generate(base) {
      generated.clear();
      for (const art of ARTS) {
        const url = new URL(`stories/${art.id}.html`, base);
        const qr = qrFor(url);
        generated.set(art.id, { qr, url });
        $(`#qr-${art.id}`).innerHTML = qrSVG(qr, art.id, `${art.name}故事二维码`);
        $(`#link-${art.id}`).textContent = url.href;
        $(`#link-${art.id}`).href = url.href;
      }
      currentBase = base;
      document.querySelectorAll('[data-download], [data-copy], #print-cards').forEach(el => el.disabled = false);
      status.classList.remove('error');
      status.textContent = '四张故事卡已生成。正式印刷前，请用手机分别扫码，核对网址和故事。';
    }
    function invalidate(message) {
      currentBase = null; generated.clear();
      document.querySelectorAll('[data-download], [data-copy], #print-cards').forEach(el => el.disabled = true);
      ARTS.forEach(art => {
        $(`#qr-${art.id}`).innerHTML = '<p class="qr-placeholder">输入正式网站地址<br>生成故事二维码</p>';
        const link = $(`#link-${art.id}`); link.removeAttribute('href'); link.textContent = '等待正式网站地址';
      });
      status.textContent = message;
    }
    input.addEventListener('input', () => invalidate('网址已更改，请点击“生成四张故事卡”。'));
    qrForm.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const base = new URL(input.value.trim());
        if (!isPublicURL(base) || /\.(html?|pdf)$/i.test(base.pathname)) throw new Error('Invalid base');
        base.pathname = base.pathname.replace(/\/+$/, '') + '/';
        generate(base); input.value = base.href;
      } catch {
        invalidate('请填写公开的 HTTPS 网站根地址，不要包含故事页文件名、参数或本机地址。');
        status.classList.add('error'); input.focus();
      }
    });
    if (isPublicURL(ROOT)) { input.value = ROOT.href; generate(ROOT); }
    else invalidate('当前为本地预览。网站上线后从正式网址打开此页，即可自动生成；也可以填写已发布的网站根地址。');
    function saveBlob(blob, name) {
      const objectURL = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = objectURL; link.download = name;
      link.click(); setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
    }
    document.querySelectorAll('[data-download]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.download;
      const entry = generated.get(id);
      if (!entry) return;
      const art = ARTS.find(a => a.id === id);
      if (button.dataset.format === 'svg') {
        saveBlob(new Blob([qrSVG(entry.qr, `${id}-print`, `${art.name}故事二维码`)], { type: 'image/svg+xml;charset=utf-8' }), `章村四艺-${art.name}-二维码.svg`);
      } else {
        const count = entry.qr.getModuleCount(), scale = 20, quiet = 4;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = (count + quiet * 2) * scale;
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (entry.qr.isDark(r, c)) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        canvas.toBlob(blob => { if (blob) saveBlob(blob, `章村四艺-${art.name}-二维码.png`); }, 'image/png');
      }
      toast(`${art.name}二维码已开始下载`);
    }));
    document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
      const entry = generated.get(button.dataset.copy); if (!entry) return;
      try { await copyText(entry.url.href); toast('故事链接已复制'); }
      catch { toast('复制未成功，请长按卡片下方网址复制'); }
    }));
    $('#print-cards').addEventListener('click', () => { if (currentBase) window.print(); });
  }
})();
