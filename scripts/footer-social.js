(() => {
  'use strict';
  const linkedin = 'https://www.linkedin.com/company/bhoc-therapeutics/';
  const youtube = 'https://www.youtube.com/@BHOCTherapeutics';
  const footer = document.querySelector('footer');
  if (!footer || footer.querySelector('.bhoc-footer-socials')) return;
  const style = document.createElement('style');
  style.textContent = '.bhoc-footer-socials{display:inline-flex;align-items:center;gap:7px;margin-left:10px;vertical-align:middle;white-space:nowrap}.bhoc-footer-social-link{display:inline-flex;align-items:center;justify-content:center;width:29px;height:29px;border:1px solid currentColor;border-radius:9px;text-decoration:none}.bhoc-footer-social-link:hover{opacity:.82;transform:translateY(-1px)}.bhoc-footer-social-link svg{width:17px;height:17px;display:block}.bhoc-footer-social-link[data-network="linkedin"]{color:#0a66c2}.bhoc-footer-social-link[data-network="youtube"]{color:#ff0000}';
  document.head.appendChild(style);
  footer.querySelectorAll('a[href*="linkedin.com"],a[href*="youtube.com/@BHOCTherapeutics"]').forEach(a => a.remove());
  const make = (href, network, label, svg) => {
    const a = document.createElement('a');
    a.className = 'bhoc-footer-social-link';
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.dataset.network = network; a.setAttribute('aria-label', label); a.title = label; a.innerHTML = svg;
    return a;
  };
  const li = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.3 7.9H1.8V19h3.5V7.9ZM3.55 2.5A2.04 2.04 0 1 0 3.55 6.58 2.04 2.04 0 0 0 3.55 2.5ZM19 12.65c0-3.35-1.79-4.91-4.18-4.91-1.93 0-2.79 1.06-3.27 1.8V7.9H8.06V19h3.49v-5.5c0-1.45.27-2.86 2.08-2.86 1.78 0 1.8 1.67 1.8 2.96V19H19v-6.35Z"/></svg>';
  const yt = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor"/><path d="m10 9 5.5 3-5.5 3Z" fill="white"/></svg>';
  const nav = document.createElement('span');
  nav.className = 'bhoc-footer-socials'; nav.setAttribute('role','group'); nav.setAttribute('aria-label','BHOC social media');
  nav.append(make(linkedin,'linkedin','BHOC Therapeutics on LinkedIn',li),make(youtube,'youtube','BHOC Therapeutics on YouTube',yt));
  const target = footer.querySelector('.footer-row > span:last-child, .platform-version, p:last-of-type') || footer;
  target.appendChild(nav);
})();