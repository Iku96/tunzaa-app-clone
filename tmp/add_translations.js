const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');
const files = ['en.json', 'sw.json', 'fr.json'];

const translations = {
  en: {
    paymentSuccessInstallmentDesc: "You've successfully completed the first payment towards your goal! Keep up the great work. We've sent a detailed receipt to your email address for your records.",
    paymentSuccessFullDesc: "You've successfully completed your full payment! We've sent a detailed receipt to your email address for your records.",
    paymentSuccessCongratulations: "Congratulations {{name}}!"
  },
  sw: {
    paymentSuccessInstallmentDesc: "Umefanikiwa kukamilisha malipo ya kwanza kuelekea lengo lako! Endelea na kazi nzuri. Tumetuma risiti ya kina kwenye anwani yako ya barua pepe kwa kumbukumbu zako.",
    paymentSuccessFullDesc: "Umefanikiwa kukamilisha malipo yako kamili! Tumetuma risiti ya kina kwenye anwani yako ya barua pepe kwa kumbukumbu zako.",
    paymentSuccessCongratulations: "Hongera {{name}}!"
  },
  fr: {
    paymentSuccessInstallmentDesc: "Vous avez réussi le premier paiement pour atteindre votre objectif ! Continuez ce bon travail. Nous avons envoyé un reçu détaillé à votre adresse e-mail pour vos dossiers.",
    paymentSuccessFullDesc: "Vous avez réussi à effectuer votre paiement intégral ! Nous avons envoyé un reçu détaillé à votre adresse e-mail pour vos dossiers.",
    paymentSuccessCongratulations: "Félicitations {{name}}!"
  }
};

files.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data = { ...data, ...translations[lang] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
