import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = ['en', 'ru'];

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'en';

  const handleChange = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('appLanguage', language);
  };

  return (
    <div className="language-switcher" aria-label={t('language.label')}>
      {languages.map((language) => (
        <button
          key={language}
          className={`language-switcher__button${currentLanguage === language ? ' language-switcher__button--active' : ''}`}
          type="button"
          onClick={() => handleChange(language)}
        >
          {t(`language.${language}`)}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
