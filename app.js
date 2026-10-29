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
      $('#share-address').textContent = isPublicURL(ROOT) ? url.href : '分享功能将在正式网站中启用。';
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
})();
