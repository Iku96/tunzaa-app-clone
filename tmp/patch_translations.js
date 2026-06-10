const fs = require('fs');

const filePath = 'src/i18n/translations.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('paymentSuccessCongratulations')) {
    // 1. Add to interface
    content = content.replace(
        /export interface TranslationKeys \{/,
        'export interface TranslationKeys {\n    paymentSuccessInstallmentDesc: string;\n    paymentSuccessFullDesc: string;\n    paymentSuccessCongratulations: string;'
    );

    // 2. Add to en
    content = content.replace(
        /const en: TranslationKeys = \{/,
        'const en: TranslationKeys = {\n    paymentSuccessInstallmentDesc: "You\'ve successfully completed the first payment towards your goal! Keep up the great work. We\'ve sent a detailed receipt to your email address for your records.",\n    paymentSuccessFullDesc: "You\'ve successfully completed your full payment! We\'ve sent a detailed receipt to your email address for your records.",\n    paymentSuccessCongratulations: "Congratulations {{name}}!",'
    );

    // 3. Add to sw
    content = content.replace(
        /const sw: TranslationKeys = \{/,
        'const sw: TranslationKeys = {\n    paymentSuccessInstallmentDesc: "Umefanikiwa kukamilisha malipo ya kwanza kuelekea lengo lako! Endelea na kazi nzuri. Tumetuma risiti ya kina kwenye anwani yako ya barua pepe kwa kumbukumbu zako.",\n    paymentSuccessFullDesc: "Umefanikiwa kukamilisha malipo yako kamili! Tumetuma risiti ya kina kwenye anwani yako ya barua pepe kwa kumbumbu zako.",\n    paymentSuccessCongratulations: "Hongera {{name}}!",'
    );

    // 4. Add to fr
    content = content.replace(
        /const fr: TranslationKeys = \{/,
        'const fr: TranslationKeys = {\n    paymentSuccessInstallmentDesc: "Vous avez réussi le premier paiement pour atteindre votre objectif ! Continuez ce bon travail. Nous avons envoyé un reçu détaillé à votre adresse e-mail pour vos dossiers.",\n    paymentSuccessFullDesc: "Vous avez réussi à effectuer votre paiement intégral ! Nous avons envoyé un reçu détaillé à votre adresse e-mail pour vos dossiers.",\n    paymentSuccessCongratulations: "Félicitations {{name}}!",'
    );

    // Add fallbacks to others (ar, es, pt, zh)
    ['ar', 'es', 'pt', 'zh'].forEach(lang => {
        const regex = new RegExp(`const ${lang}: TranslationKeys = \\{`);
        content = content.replace(
            regex,
            `const ${lang}: TranslationKeys = {\n    paymentSuccessInstallmentDesc: "You've successfully completed the first payment towards your goal! Keep up the great work. We've sent a detailed receipt to your email address for your records.",\n    paymentSuccessFullDesc: "You've successfully completed your full payment! We've sent a detailed receipt to your email address for your records.",\n    paymentSuccessCongratulations: "Congratulations {{name}}!",`
        );
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Translations patched successfully!');
} else {
    console.log('Translations already exist.');
}
