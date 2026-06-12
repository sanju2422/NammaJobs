/**
 * NammaJobs Language System — lang.js
 * Phase 2A: Foundation only (toggle + localStorage)
 * Phase 2B: Will add data-driven bilingual content
 * 
 * Usage:
 *   - Add class="lang-en" to English-only content
 *   - Add class="lang-kn" to Kannada-only content
 *   - Future DB fields: title_en/title_kn, dept_en/dept_kn etc.
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
}

// Apply language to DOM
function njApplyLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);

  // Update toggle button state
  const btnEn = document.getElementById('lang-btn-en');
  const btnKn = document.getElementById('lang-btn-kn');
  if (btnEn && btnKn) {
    if (lang === 'kn') {
      btnEn.classList.remove('lang-active');
      btnKn.classList.add('lang-active');
    } else {
      btnKn.classList.remove('lang-active');
      btnEn.classList.add('lang-active');
    }
  }
}

// Toggle between EN and KN
function njToggleLang(lang) {
  njSetLang(lang);
}

// Init on page load
function njLangInit() {
  const lang = njGetLang();
  njApplyLang(lang);
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', njLangInit);
} else {
  njLangInit();
}
