/* Keep in sync with src/i18n/locale.ts. Runs before paint so the
   document language matches the environment without a flash. */
(function () {
  var STORAGE_KEY = 'bpmn-editor-locale';
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    saved = null;
  }

  var languages = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || 'en'];
  var primary = String(languages[0] || 'en').toLowerCase();
  var locale = saved === 'en' || saved === 'zh' ? saved : (primary.indexOf('zh') === 0 ? 'zh' : 'en');

  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dataset.locale = locale;
})();
