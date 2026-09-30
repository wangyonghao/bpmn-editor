export type Locale = 'en' | 'zh';

export const LOCALE_STORAGE_KEY = 'bpmn-editor-locale';

export function localeFromPreference(
  languages: readonly string[],
  saved: string | null
): Locale {
  if (saved === 'en' || saved === 'zh') {
    return saved;
  }
  const primary = (languages[0] || 'en').toLowerCase();
  return primary.startsWith('zh') ? 'zh' : 'en';
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

let current: Locale = localeFromPreference(
  typeof navigator === 'undefined'
    ? ['en']
    : navigator.languages?.length
      ? navigator.languages
      : [navigator.language || 'en'],
  typeof localStorage === 'undefined' ? null : readSaved()
);

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* private mode */
  }
  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dataset.locale = locale;
}

export function applyDocumentLocale(): void {
  document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
  document.documentElement.dataset.locale = current;
}

export function bindLocaleSwitch(onChange: (locale: Locale) => void): void {
  document.querySelectorAll<HTMLButtonElement>('[data-set-locale]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.setLocale;
      if (next !== 'en' && next !== 'zh') {
        return;
      }
      if (next === current) {
        return;
      }
      setLocale(next);
      syncLocaleSwitch();
      onChange(next);
    });
  });
}

export function syncLocaleSwitch(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-set-locale]').forEach((button) => {
    const active = button.dataset.setLocale === current;
    button.setAttribute('aria-pressed', String(active));
  });
  const group = document.querySelector('.lang-switch');
  if (group) {
    group.setAttribute('aria-label', current === 'zh' ? '语言' : 'Language');
  }
}
