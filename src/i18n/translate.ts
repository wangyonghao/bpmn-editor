import { getLocale, type Locale } from './locale';
import { zhBpmn } from './zh-bpmn';

export function translateTemplate(
  locale: Locale,
  template: string,
  replacements?: Record<string, string>
): string {
  const dictionary = locale === 'zh' ? zhBpmn : undefined;
  const text = dictionary?.[template] ?? template;
  return text.replace(/\{([^}]+)}/g, (_, key: string) => {
    return replacements?.[key] ?? `{${key}}`;
  });
}

export function createTranslateModule(locale: Locale = getLocale()) {
  return {
    translate: [
      'value',
      function customTranslate(template: string, replacements?: Record<string, string>) {
        return translateTemplate(locale, template, replacements);
      }
    ]
  };
}
