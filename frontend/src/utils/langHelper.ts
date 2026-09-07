import { useTranslation } from 'react-i18next'

export function useLocalizedText() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language || 'en'

  const localized = (en: string, mr: string, hi?: string): string => {
    if (lang.startsWith('mr')) return mr
    if (lang.startsWith('hi')) return hi || mr
    return en
  }

  return { t, i18n, lang, localized }
}
