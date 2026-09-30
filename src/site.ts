import { applyDocumentLocale, bindLocaleSwitch, syncLocaleSwitch } from './i18n/locale';
import { t, type MessageKey } from './i18n/messages';
import './site.css';

function renderSite() {
  document.title = t('siteTitle');
  applyDocumentLocale();
  syncLocaleSwitch();

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey | undefined;
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria as MessageKey | undefined;
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });

  const nav = document.querySelector('.engine-nav');
  if (nav) {
    nav.setAttribute('aria-label', t('navLabel'));
  }

  document.documentElement.dataset.ready = 'true';
}

renderSite();
bindLocaleSwitch(() => {
  renderSite();
});
