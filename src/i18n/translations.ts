/**
 * App translation strings (i18n).
 *
 * Keys are shared across locales; add a key here and in each locale object
 * when introducing new copy. Use flat objects for simplicity; for large apps
 * consider splitting by screen or feature.
 *
 * To add a new language:
 * 1. Add the language in src/constants/languages.ts (SUPPORTED_LANGUAGES).
 * 2. Add a new entry below with the same keys and translated values.
 */

import type { LanguageCode } from '../constants/languages';

/** Translation keys used across the app. Add new keys here and in each locale. */
export interface TranslationKeys {
    // --- Language screen ---
    languageScreenTitle: string;
    languageScreenChoosePreferred: string;
    languageScreenSkip: string;

    // --- Role screen ---
    roleScreenTitle: string;
    roleScreenDescription: string;
    roleScreenBuyer: string;
    roleScreenBusiness: string;
    roleScreenOr: string;
    roleScreenSkip: string;
    roleScreenBack: string;

    // --- Home (placeholder) ---
    homeWelcome: string;
    homeComingSoon: string;
}

/** English (default). */
const en: TranslationKeys = {
    languageScreenTitle: 'Choose your language',
    languageScreenChoosePreferred: 'Choose preferred language',
    languageScreenSkip: 'Skip',

    roleScreenTitle: 'Choose what describes you best',
    roleScreenDescription:
        "Achieve your financial goals through a save-to-buy model.\nBusinesses sell, deliver and offer financial services.",
    roleScreenBuyer: "I'm a buyer",
    roleScreenBusiness: "I'm a business",
    roleScreenOr: 'OR',
    roleScreenSkip: 'Skip',
    roleScreenBack: 'Go back',

    homeWelcome: 'Welcome to Tunzaa!',
    homeComingSoon: 'Marketplace coming soon...',
};

/** Swahili. */
const sw: TranslationKeys = {
    languageScreenTitle: 'Chagua lugha yako',
    languageScreenChoosePreferred: 'Chagua lugha unayopendelea',
    languageScreenSkip: 'Ruka',

    roleScreenTitle: 'Chagua kinachokufanana zaidi',
    roleScreenDescription:
        'Fikia malengo yako ya kifedha kupitia mfumo wa kuokota-ili-kununua.\nWafanyabiashara wanauza, wasafirisha na kutoa huduma za kifedha.',
    roleScreenBuyer: 'Mimi ni mnunuzi',
    roleScreenBusiness: 'Mimi ni biashara',
    roleScreenOr: 'AU',
    roleScreenSkip: 'Ruka',
    roleScreenBack: 'Rudi',

    homeWelcome: 'Karibu Tunzaa!',
    homeComingSoon: 'Soko linakuja hivi karibuni...',
};

/** French. */
const fr: TranslationKeys = {
    languageScreenTitle: 'Choisissez votre langue',
    languageScreenChoosePreferred: 'Choisir la langue préférée',
    languageScreenSkip: 'Passer',

    roleScreenTitle: 'Choisissez ce qui vous décrit le mieux',
    roleScreenDescription:
        'Atteignez vos objectifs financiers grâce à un modèle épargner-pour-acheter.\nLes entreprises vendent, livrent et offrent des services financiers.',
    roleScreenBuyer: 'Je suis acheteur',
    roleScreenBusiness: 'Je suis une entreprise',
    roleScreenOr: 'OU',
    roleScreenSkip: 'Passer',
    roleScreenBack: 'Retour',

    homeWelcome: 'Bienvenue chez Tunzaa!',
    homeComingSoon: 'Marketplace bientôt disponible...',
};

/** Arabic. */
const ar: TranslationKeys = {
    languageScreenTitle: 'اختر لغتك',
    languageScreenChoosePreferred: 'اختر اللغة المفضلة',
    languageScreenSkip: 'تخطي',

    roleScreenTitle: 'اختر ما يصفك بشكل أفضل',
    roleScreenDescription:
        'حقق أهدافك المالية من خلال نموذج الادخار للشراء.\nتبيع الشركات وتوصل وتقدم خدمات مالية.',
    roleScreenBuyer: 'أنا مشتري',
    roleScreenBusiness: 'أنا عمل تجاري',
    roleScreenOr: 'أو',
    roleScreenSkip: 'تخطي',
    roleScreenBack: 'رجوع',

    homeWelcome: 'مرحبا بك في تنزا!',
    homeComingSoon: 'السوق قادم قريبا...',
};

/** Spanish. */
const es: TranslationKeys = {
    languageScreenTitle: 'Elige tu idioma',
    languageScreenChoosePreferred: 'Elegir idioma preferido',
    languageScreenSkip: 'Saltar',

    roleScreenTitle: 'Elige lo que mejor te describe',
    roleScreenDescription:
        'Alcanza tus objetivos financieros a través de un modelo de ahorro para comprar.\nLas empresas venden, entregan y ofrecen servicios financieros.',
    roleScreenBuyer: 'Soy comprador',
    roleScreenBusiness: 'Soy una empresa',
    roleScreenOr: 'O',
    roleScreenSkip: 'Saltar',
    roleScreenBack: 'Volver',

    homeWelcome: '¡Bienvenido a Tunzaa!',
    homeComingSoon: 'Mercado próximamente...',
};

/** Portuguese. */
const pt: TranslationKeys = {
    languageScreenTitle: 'Escolha o seu idioma',
    languageScreenChoosePreferred: 'Escolher idioma preferido',
    languageScreenSkip: 'Pular',

    roleScreenTitle: 'Escolha o que melhor descreve você',
    roleScreenDescription:
        'Alcance seus objetivos financeiros através de um modelo de poupança para compra.\nEmpresas vendem, entregam e oferecem serviços financeiros.',
    roleScreenBuyer: 'Sou comprador',
    roleScreenBusiness: 'Sou uma empresa',
    roleScreenOr: 'OU',
    roleScreenSkip: 'Pular',
    roleScreenBack: 'Voltar',

    homeWelcome: 'Bem-vindo ao Tunzaa!',
    homeComingSoon: 'Mercado em breve...',
};

/** Chinese (Simplified). */
const zh: TranslationKeys = {
    languageScreenTitle: '选择您的语言',
    languageScreenChoosePreferred: '选择首选语言',
    languageScreenSkip: '跳过',

    roleScreenTitle: '选择最适合您的描述',
    roleScreenDescription:
        '通过先存后买模式实现您的财务目标。\n企业销售、交付并提供金融服务。',
    roleScreenBuyer: '我是买家',
    roleScreenBusiness: '我是企业',
    roleScreenOr: '或',
    roleScreenSkip: '跳过',
    roleScreenBack: '返回',

    homeWelcome: '欢迎来到Tunzaa！',
    homeComingSoon: '市场即将推出...',
};

/** German. */
const de: TranslationKeys = {
    languageScreenTitle: 'Wählen Sie Ihre Sprache',
    languageScreenChoosePreferred: 'Bevorzugte Sprache wählen',
    languageScreenSkip: 'Überspringen',

    roleScreenTitle: 'Wählen Sie, was Sie am besten beschreibt',
    roleScreenDescription:
        'Erreichen Sie Ihre finanziellen Ziele durch ein Sparen-zum-Kaufen-Modell.\nUnternehmen verkaufen, liefern und bieten Finanzdienstleistungen an.',
    roleScreenBuyer: 'Ich bin Käufer',
    roleScreenBusiness: 'Ich bin ein Unternehmen',
    roleScreenOr: 'ODER',
    roleScreenSkip: 'Überspringen',
    roleScreenBack: 'Zurück',

    homeWelcome: 'Willkommen bei Tunzaa!',
    homeComingSoon: 'Marktplatz kommt bald...',
};

/**
 * All supported translation bundles keyed by ISO 639-1 code.
 * When adding a language, add its code to SupportedLanguage and a new entry here.
 */
export const translations: Record<LanguageCode, TranslationKeys> = {
    en,
    sw,
    fr,
    ar,
    es,
    pt,
    zh,
    de,
};

/**
 * Returns the translation object for a given locale.
 * Falls back to English if the locale is missing (e.g. during development).
 */
export function getTranslations(locale: LanguageCode): TranslationKeys {
    return translations[locale] ?? translations.en;
}
