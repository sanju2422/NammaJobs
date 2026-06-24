/**
 * NammaJobs Language System — lang.js v2.0
 * Phase 2A: Toggle + localStorage ✅
 * Phase 2B: Bilingual content + fallback ✅
 *
 * Architecture:
 *   - Static content: .lang-en / .lang-kn CSS classes
 *   - Dynamic content: njField(en, kn) helper function
 *   - Categories: CATS array with nk field
 *   - Future DB: title_en/title_kn, dept/dept_kn, etc.
 */

const NJ_LANG_KEY = 'nj_lang';

// Get current language — default English
function njGetLang() {
  return localStorage.getItem(NJ_LANG_KEY) || 'en';
}

// Set language and apply globally
function njSetLang(lang) {
  localStorage.setItem(NJ_LANG_KEY, lang);
  njApplyLang(lang);
  // Re-render dynamic content if renderer exists
  if (typeof njRerender === 'function') njRerender();
}

// Apply language to DOM
function njApplyLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  // Sync EVERY language button (desktop header + mobile/tablet search-bar toggle).
  // Uses id prefixes so any toggle (lang-btn-en, lang-btn-en-m, ...) stays in sync
  // with the single shared language state — no separate state is created.
  const enBtns = document.querySelectorAll('[id^="lang-btn-en"]');
  const knBtns = document.querySelectorAll('[id^="lang-btn-kn"]');
  enBtns.forEach(function (b) { b.classList.toggle('lang-active', lang !== 'kn'); });
  knBtns.forEach(function (b) { b.classList.toggle('lang-active', lang === 'kn'); });
}

// Toggle between EN and KN
function njToggleLang(lang) {
  njSetLang(lang);
}

/**
 * Core bilingual field helper
 * Returns KN if lang=kn AND kn is non-empty, else EN
 * @param {string} en - English value
 * @param {string} kn - Kannada value (optional)
 * @returns {string}
 */
function njField(en, kn) {
  if (njGetLang() === 'kn' && kn && kn.trim() !== '') return kn;
  return en || '';
}

/**
 * Render bilingual text as HTML span pair
 * Use when you want both stored but only one shown
 */
function njSpan(en, kn) {
  return `<span class="lang-en">${en||''}</span>${kn?`<span class="lang-kn">${kn}</span>`:''}`;
}

// Init on page load
function njLangInit() {
  njApplyLang(njGetLang());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', njLangInit);
} else {
  njLangInit();
}
