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

    // --- Settings ---
    settingsTitle: string;
    settingsActivities: string;
    settingsNotifications: string;
    settingsReminders: string;
    settingsDelivery: string;
    settingsPolicies: string;
    settingsAccount: string;
    settingsInvite: string;
    settingsLanguage: string;
    settingsLogout: string;
    settingsLogoutConfirmTitle: string;
    settingsLogoutConfirmMessage: string;
    settingsVersion: string;

    // --- Onboarding Step 1 ---
    onboardingStep1Title: string;
    onboardingStep1Subtitle: string;
    onboardingStep1UploadInfo: string;
    onboardingStep1License: string;
    onboardingStep1LicensePlaceholder: string;
    onboardingStep1LicenseUpload: string;
    onboardingStep1TIN: string;
    onboardingStep1TINPlaceholder: string;
    onboardingStep1TINUpload: string;
    onboardingStep1BRELA: string;
    onboardingStep1BRELAPlaceholder: string;
    onboardingStep1BRELAUpload: string;
    onboardingStep1Skip: string;
    onboardingStep1Back: string;
    onboardingStep1Next: string;
    onboardingStep1Saving: string;

    // --- Onboarding Step 2 ---
    onboardingStep2Title: string;
    onboardingStep2Subtitle: string;
    onboardingStep2AddLogo: string;
    onboardingStep2CompanyName: string;
    onboardingStep2CompanyNamePlaceholder: string;
    onboardingStep2Phone: string;
    onboardingStep2PhonePlaceholder: string;
    onboardingStep2Description: string;
    onboardingStep2DescriptionPlaceholder: string;
    onboardingStep2CharLimit: string;
    onboardingStep2Required: string;
    onboardingStep2PermissionError: string;
    onboardingStep2ValidationShopName: string;

    // --- Onboarding Step 3 ---
    onboardingStep3Title: string;
    onboardingStep3Subtitle: string;
    onboardingStep3CardTitle: string;
    onboardingStep3ManualButton: string;
    onboardingStep3Or: string;
    onboardingStep3GPSButton: string;

    // --- Onboarding Step 3 Manual/Map ---
    onboardingStep3RegionLabel: string;
    onboardingStep3MunicipalLabel: string;
    onboardingStep3WardLabel: string;
    onboardingStep3RegionPlaceholder: string;
    onboardingStep3MunicipalPlaceholder: string;
    onboardingStep3WardPlaceholder: string;
    onboardingStep3NotesLabel: string;
    onboardingStep3NotesPlaceholder: string;
    onboardingStep3ValidationLocation: string;
    onboardingStep3Save: string;
    onboardingStep3ManualSubtitle: string;
    onboardingStep3MapSubtitle: string;
    onboardingStep3MapMarker: string;

    // --- Onboarding Step 4 ---
    onboardingStep4Title: string;
    onboardingStep4Subtitle: string;
    onboardingStep4Edit: string;
    onboardingStep4NotesLabel: string;
    onboardingStep4MultiLocationQuestion: string;
    onboardingStep4AddShop: string;

    // --- Onboarding Step 5 ---
    onboardingStep5Title: string;
    onboardingStep5Subtitle: string;
    onboardingStep5CardHeader: string;
    onboardingStep5License: string;
    onboardingStep5TIN: string;
    onboardingStep5BRELA: string;
    onboardingStep5UploadPrimary: string;
    onboardingStep5UploadSecondary: string;
    onboardingStep5UploadSuccess: string;
    onboardingStep5SkipLater: string;
    onboardingStep5Wait: string;
    onboardingStep5Uploading: string;
    onboardingStep5SuccessModalTitle: string;
    onboardingStep5SuccessModalDescription: string;
    onboardingStep5SuccessModalButton: string;

    // Login Screen
    loginTitle: string;
    loginSubtitle: string;
    loginInputPlaceholder: string;
    loginPasswordPlaceholder: string;
    loginForgotPassword: string;
    loginAgreedTerms: string;
    loginButton: string;
    loginOrContinue: string;
    loginNoAccount: string;
    loginSkip: string;
    // OTP Screen
    otpTitle: string;
    otpInstruction: string;
    otpNoCode: string;
    otpResend: string;
    otpTimer: string;
    otpContinue: string;
    otpInvalidCode: string;
    otpEnterAllDigits: string;
    otpVerifyFailed: string;
    // Forgot Password
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    // Mauzo Intro
    commonLoading: string;
    // --- Mauzo Intro ---
    mauzoHeader: string;
    mauzoSlide1Title: string;
    mauzoSlide1Desc: string;
    mauzoSlide2Title: string;
    mauzoSlide2Desc: string;
    mauzoSlide3Title: string;
    mauzoSlide3Desc: string;
    mauzoSlide4Title: string;
    mauzoSlide4Desc: string;
    mauzoCreateAccount: string;
    mauzoAlreadyAccount: string;
    mauzoSignIn: string;
    // --- Delivery Flow ---
    deliveryLoginTitle: string;
    deliveryPhoneLabel: string;
    deliveryPasswordLabel: string;
    deliverySaveInfo: string;
    deliveryForgotPassword: string;
    deliveryCreateAccount: string;
    deliverySigningIn: string;
    deliveryContinue: string;
    deliveryBack: string;
    deliveryOtpTitle: string;
    deliveryOtpSubtitle: string;
    deliveryWrongNumber: string;
    deliveryNoOtp: string;
    deliveryRequestAgain: string;
    deliveryVerifying: string;
    deliveryVerify: string;
    deliverySuccessLogin: string;
    deliverySuccessVerify: string;
    deliveryErrorLogin: string;
    deliveryErrorOtp: string;
    // --- Register Screen ---
    registerTitleBuyer: string;
    registerTitleMerchant: string;
    registerSubtitlePreFilled: string;
    registerSubtitleEmpty: string;
    registerFirstNamePlaceholder: string;
    registerLastNamePlaceholder: string;
    registerPhoneEmailPlaceholder: string;
    registerPasswordPlaceholder: string;
    registerButton: string;
    registerAlreadyAccount: string;
    registerTermsLink: string;
    // --- Role Screen ---
    roleScreenOptionSell: string;
    roleScreenOptionDelivery: string;
    roleScreenOptionFinancial: string;
    roleScreenOptionAffiliate: string;
    roleScreenAlreadyAccount: string;
    // --- Common ---
    commonNext: string;
    commonBack: string;
    commonSaving: string;
    commonSuccess: string;
    commonError: string;
    commonTryAgain: string;
    // --- Affiliate Flow ---
    affiliateRegisterTitle: string;
    affiliateLoginTitle: string;
    affiliatePhonePlaceholder: string;
    affiliateTermsAgreement: string;
    affiliateRegisterButton: string;
    affiliateNoAccount: string;
    affiliateLoginLink: string;
    affiliateAlreadyAccount: string;
    // --- Auth Alerts ---
    authTermsRequired: string;
    authTermsRequiredMsg: string;
    authMissingFields: string;
    authMissingFieldsMsg: string;
    authLoginFailed: string;
    authLoginFailedMsg: string;
    authRegistrationError: string;
    authRegistrationErrorMsg: string;
    authEmailRequired: string;
    authEmailRequiredMsg: string;
    authSocialLoginError: string;
    // --- Delivery Register ---
    deliveryRegisterFullNameLabel: string;
    deliveryRegisterFullNamePlaceholder: string;
    deliveryRegisterNameError: string;
    // --- Order & Delivery ---
    orderShipped: string;
    orderReceived: string;
    orderReturn: string;
    deliveryReviewOrder: string;
    deliveryDropOffLocation: string;
    deliveryNoActive: string;
    deliveryEstimatedTime: string;
    deliveryStandard: string;
    deliveryExpress: string;
    deliveryPostalAddress: string;
    deliveryDropOffAddress: string;
    deliveryCallDriver: string;
    deliveryCost: string;
    deliveryConfirm: string;
    // --- Loans ---
    "vendor.loans.loans_request": string;
    "vendor.loans.repayments_track": string;
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

    settingsTitle: 'Settings',
    settingsActivities: 'Your Activities',
    settingsNotifications: 'In-App Notifications',
    settingsReminders: 'Reminders',
    settingsDelivery: 'Delivery Orders',
    settingsPolicies: 'Policies',
    settingsAccount: 'Account Manage',
    settingsInvite: 'Invite Friends',
    settingsLanguage: 'Language',
    settingsLogout: 'Log out',
    settingsLogoutConfirmTitle: 'Log Out',
    settingsLogoutConfirmMessage: 'Are you sure you want to log out?',
    settingsVersion: 'Tunzaa Version 2.0',

    onboardingStep1Title: 'Business Documents',
    onboardingStep1Subtitle: 'It is important to attach business documents for better security of your account.',
    onboardingStep1UploadInfo: 'Upload the following information',
    onboardingStep1License: 'Business License',
    onboardingStep1LicensePlaceholder: 'Enter license number',
    onboardingStep1LicenseUpload: 'Upload License (PDF/Image)',
    onboardingStep1TIN: 'Business TIN',
    onboardingStep1TINPlaceholder: 'Enter TIN number',
    onboardingStep1TINUpload: 'Upload TIN (PDF/Image)',
    onboardingStep1BRELA: 'BRELA Registration Certificate',
    onboardingStep1BRELAPlaceholder: 'Enter registration number',
    onboardingStep1BRELAUpload: 'Upload Certificate (PDF/Image)',
    onboardingStep1Skip: 'Set up later',
    onboardingStep1Back: 'Back',
    onboardingStep1Next: 'Continue',
    onboardingStep1Saving: 'Saving...',

    onboardingStep2Title: 'Shop Details',
    onboardingStep2Subtitle: 'Logo, shop name and shop description are important in creating your shop on Tunzaa.',
    onboardingStep2AddLogo: 'Add logo*',
    onboardingStep2CompanyName: 'Company name',
    onboardingStep2CompanyNamePlaceholder: 'Enter company name',
    onboardingStep2Phone: 'Shop phone number',
    onboardingStep2PhonePlaceholder: 'Example: +255 700 000 000',
    onboardingStep2Description: 'Add more details',
    onboardingStep2DescriptionPlaceholder: 'Enter description here',
    onboardingStep2CharLimit: 'Should not exceed 240 words',
    onboardingStep2Required: 'Required section',
    onboardingStep2PermissionError: 'Sorry, we need permission to access your photos.',
    onboardingStep2ValidationShopName: 'Please enter your company or shop name.',

    onboardingStep3Title: 'Shop Location',
    onboardingStep3Subtitle: 'Enable customers to follow products easily by setting your shop location.',
    onboardingStep3CardTitle: 'Set shop location',
    onboardingStep3ManualButton: 'Enter using text',
    onboardingStep3Or: 'Or',
    onboardingStep3GPSButton: 'Choose on map',
    onboardingStep3RegionLabel: 'Region',
    onboardingStep3MunicipalLabel: 'Municipal',
    onboardingStep3WardLabel: 'Ward',
    onboardingStep3RegionPlaceholder: 'Example: Dar es Salaam',
    onboardingStep3MunicipalPlaceholder: 'Example: Kinondoni',
    onboardingStep3WardPlaceholder: 'Example: Kijitonyama',
    onboardingStep3NotesLabel: 'Extra details',
    onboardingStep3NotesPlaceholder: 'Example: Street 7, near pharmacy...',
    onboardingStep3ValidationLocation: 'Please select Region, Municipal and Ward.',
    onboardingStep3Save: 'Save',
    onboardingStep3ManualSubtitle: 'Fill in your location information accurately so that customers can find you easily.',
    onboardingStep3MapSubtitle: 'Drag the pin on the map to choose the correct location for your shop.',
    onboardingStep3MapMarker: 'Your Shop',

    onboardingStep4Title: 'Review Information',
    onboardingStep4Subtitle: 'Review your shop details before continuing.',
    onboardingStep4Edit: 'Edit',
    onboardingStep4NotesLabel: 'Extra details',
    onboardingStep4MultiLocationQuestion: 'Do you have more than one shop location?',
    onboardingStep4AddShop: 'Add Shop',

    onboardingStep5Title: 'Business Documents',
    onboardingStep5Subtitle: 'It is important to attach business documents for added security of your account.',
    onboardingStep5CardHeader: 'Upload the following information',
    onboardingStep5License: 'Business License',
    onboardingStep5TIN: 'Business TIN',
    onboardingStep5BRELA: 'BRELA Registration Certificate',
    onboardingStep5UploadPrimary: 'Click here to upload',
    onboardingStep5UploadSecondary: 'PDF, PNG or JPG (Max 5MB)',
    onboardingStep5UploadSuccess: 'Document uploaded successfully',
    onboardingStep5SkipLater: 'Add later',
    onboardingStep5Wait: 'Wait...',
    onboardingStep5Uploading: 'Uploading...',
    onboardingStep5SuccessModalTitle: 'Congratulations!',
    onboardingStep5SuccessModalDescription: 'We have received your documents. Please wait a bit while we review the details in the next 24 to 48 hours.',
    onboardingStep5SuccessModalButton: 'Okay',

    // Login Screen
    loginTitle: "Welcome Back",
    loginSubtitle: "Enter your details to sign in",
    loginInputPlaceholder: "Phone Number or Email",
    loginPasswordPlaceholder: "Enter password",
    loginForgotPassword: "Forgot Password?",
    loginAgreedTerms: "I agree to the Terms and Conditions",
    loginButton: "Log In",
    loginOrContinue: "or continue with",
    loginNoAccount: "Don't have an account? Sign up",
    loginSkip: "Skip",
    otpTitle: "Verify & create password",
    otpInstruction: "Enter the 6-digit code sent to your phone number or email",
    otpNoCode: "Didn't receive code?",
    otpResend: "Resend",
    otpTimer: "Resend code in",
    otpContinue: "Continue",
    otpInvalidCode: "Invalid Code",
    otpEnterAllDigits: "Please enter all 6 digits",
    otpVerifyFailed: "Verification Failed",
    forgotPasswordTitle: "Forgot Password",
    forgotPasswordSubtitle: "Password recovery feature coming soon.",
    commonLoading: "Loading...",
    affiliateRegisterTitle: "Create an account",
    affiliateLoginTitle: "Welcome back",
    affiliatePhonePlaceholder: "Enter +255xxx xxx xxx",
    affiliateTermsAgreement: "I have read agree to Tunzaa Terms and Conditions of use, privacy policy, and return policy",
    affiliateRegisterButton: "Create Account",
    affiliateNoAccount: "Don't have an account?",
    affiliateLoginLink: "Log in",
    affiliateAlreadyAccount: "Already have an account?",
    // Mauzo Intro
    mauzoHeader: "Mauzo by Tunzaa",
    mauzoSlide1Title: "Product Management",
    mauzoSlide1Desc: "We simplify the product management process with our simple tools where you can easily add, edit and delete products.",
    mauzoSlide2Title: "Order Management",
    mauzoSlide2Desc: "Manage your stock, sales and customer information in one place, so you can easily access this data anywhere and at any time.",
    mauzoSlide3Title: "Wallet Management",
    mauzoSlide3Desc: "Use our financial management tool to provide oversight and manage the cash flow of the financial institution.",
    mauzoSlide4Title: "Delivery Management",
    mauzoSlide4Desc: "Powered by digital tools to ensure products are moved safely and efficiently to the end customer.",
    mauzoCreateAccount: "Create an account",
    mauzoAlreadyAccount: "Already have an account? ",
    mauzoSignIn: "Sign In",
    // Delivery Flow
    deliveryLoginTitle: "Delivery Partner Login",
    deliveryPhoneLabel: "Phone Number",
    deliveryPasswordLabel: "Password",
    deliverySaveInfo: "Save My Info",
    deliveryForgotPassword: "Forgot Password?",
    deliveryCreateAccount: "Create Account",
    deliverySigningIn: "Signing In...",
    deliveryContinue: "Continue",
    deliveryBack: "Back",
    deliveryOtpTitle: "Verify Number",
    deliveryOtpSubtitle: "An OTP has been sent to your phone",
    deliveryWrongNumber: "Wrong number?",
    deliveryNoOtp: "Didn't get OTP?",
    deliveryRequestAgain: "Request again",
    deliveryVerifying: "Verifying...",
    deliveryVerify: "Verify",
    deliverySuccessLogin: "Login Success",
    deliverySuccessVerify: "Verification Success",
    deliveryErrorLogin: "Check your credentials",
    deliveryErrorOtp: "Invalid OTP code",
    // Register Screen
    registerTitleBuyer: "Create an account",
    registerTitleMerchant: "Join as a Merchant",
    registerSubtitlePreFilled: "Review your pre-filled details",
    registerSubtitleEmpty: "Please fill in your details to get started",
    registerFirstNamePlaceholder: "Enter your first name",
    registerLastNamePlaceholder: "Enter your second name",
    registerPhoneEmailPlaceholder: "Enter phone number",
    registerPasswordPlaceholder: "Password",
    registerButton: "Create Account",
    registerAlreadyAccount: "Already have an account? Sign In",
    registerTermsLink: "Terms and Conditions",
    // Role Screen
    roleScreenOptionSell: "Sell products / Services",
    roleScreenOptionDelivery: "Provide delivery services",
    roleScreenOptionFinancial: "Offer loans and financial services",
    roleScreenOptionAffiliate: "Join as winga",
    roleScreenAlreadyAccount: "Already have an account?",
    // Common
    commonNext: "Next",
    commonBack: "Back",
    commonSaving: "Saving...",
    commonSuccess: "Success",
    commonError: "Error",
    commonTryAgain: "Please try again",
    // Auth Alerts
    authTermsRequired: "Terms Required",
    authTermsRequiredMsg: "Please agree to Terms and Conditions",
    authMissingFields: "Missing Fields",
    authMissingFieldsMsg: "Please fill in all fields",
    authLoginFailed: "Login Failed",
    authLoginFailedMsg: "Error signing in. Please check your credentials.",
    authRegistrationError: "Registration Error",
    authRegistrationErrorMsg: "Error creating account. Please try again.",
    authEmailRequired: "Phone Number Required",
    authEmailRequiredMsg: "Please use a phone number to register. Email-based registration requires a phone number for OTP verification.",
    authSocialLoginError: "Login Error",
    // Delivery Register
    deliveryRegisterFullNameLabel: "Full Name",
    deliveryRegisterFullNamePlaceholder: "Jeremiah Charles",
    deliveryRegisterNameError: "Please enter at least two names.",
    orderShipped: "Shipped",
    orderReceived: "Received",
    orderReturn: "Return",
    deliveryReviewOrder: "Review your order before delivery",
    deliveryDropOffLocation: "Drop-off location",
    deliveryNoActive: "No active delivery",
    deliveryEstimatedTime: "Estimated delivery time",
    deliveryStandard: "Standard",
    deliveryExpress: "Express",
    deliveryPostalAddress: "Postal Address",
    deliveryDropOffAddress: "Drop-off Address",
    deliveryCallDriver: "Call Driver",
    deliveryCost: "Delivery Cost",
    deliveryConfirm: "Confirm",
    // --- Loans ---
    "vendor.loans.loans_request": "Loans Request",
    "vendor.loans.repayments_track": "Repayments Track",
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

    settingsTitle: 'Mipangilio',
    settingsActivities: 'Shughuli zako',
    settingsNotifications: 'Taarifa za ndani ya programu',
    settingsReminders: 'Vikumbusho',
    settingsDelivery: 'Maagizo ya Usafirishaji',
    settingsPolicies: 'Sera',
    settingsAccount: 'Simamia Akaunti',
    settingsInvite: 'Alika Marafiki',
    settingsLanguage: 'Lugha',
    settingsLogout: 'Ondoka',
    settingsLogoutConfirmTitle: 'Ondoka',
    settingsLogoutConfirmMessage: 'Je, una uhakika unataka kuondoka?',
    settingsVersion: 'Tunzaa Toleo la 2.0',

    onboardingStep1Title: 'Hati Za Biashara',
    onboardingStep1Subtitle: 'Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.',
    onboardingStep1UploadInfo: 'Pakia taarifa zifuatazo',
    onboardingStep1License: 'Leseni ya Biashara',
    onboardingStep1LicensePlaceholder: 'Ingiza namba ya leseni',
    onboardingStep1LicenseUpload: 'Pakia Leseni (PDF/Picha)',
    onboardingStep1TIN: 'TIN ya Biashara',
    onboardingStep1TINPlaceholder: 'Ingiza namba ya TIN',
    onboardingStep1TINUpload: 'Pakia TIN (PDF/Picha)',
    onboardingStep1BRELA: 'Cheti cha usajili BRELA',
    onboardingStep1BRELAPlaceholder: 'Ingiza namba ya usajili',
    onboardingStep1BRELAUpload: 'Pakia Cheti (PDF/Picha)',
    onboardingStep1Skip: 'Weka baadaye',
    onboardingStep1Back: 'Rudi',
    onboardingStep1Next: 'Endelea',
    onboardingStep1Saving: 'Inahifadhi...',

    onboardingStep2Title: 'Weka Taarifa Za Duka',
    onboardingStep2Subtitle: 'Logo, jina la duka na maelezo ya duka ni muhimu katika kuunda duka lako Tunzaa.',
    onboardingStep2AddLogo: 'Weka logo*',
    onboardingStep2CompanyName: 'Jina la kampuni',
    onboardingStep2CompanyNamePlaceholder: 'Weka jina la kampuni',
    onboardingStep2Phone: 'Namba ya simu ya duka',
    onboardingStep2PhonePlaceholder: 'Mfano: +255 700 000 000',
    onboardingStep2Description: 'Weka Maelezo zaidi',
    onboardingStep2DescriptionPlaceholder: 'Weka maelezo hapa',
    onboardingStep2CharLimit: 'Isizidi maneno 240',
    onboardingStep2Required: 'Sehemu ya lazima',
    onboardingStep2PermissionError: 'Samahani, tunahitaji ruhusa ya kufikia picha zako.',
    onboardingStep2ValidationShopName: 'Tafadhali weka jina la kampuni au duka lako.',

    onboardingStep3Title: 'Eneo La Duka',
    onboardingStep3Subtitle: 'Wezesha wateja kufuata bidhaa kwa urahisi kwa kuweka eneo la duka lako.',
    onboardingStep3CardTitle: 'Weka eneo la duka',
    onboardingStep3ManualButton: 'Weka kwa kutumia maandishi',
    onboardingStep3Or: 'Au',
    onboardingStep3GPSButton: 'Chagua kwenye ramani',
    onboardingStep3RegionLabel: 'Mkoa',
    onboardingStep3MunicipalLabel: 'Wilaya',
    onboardingStep3WardLabel: 'Kata',
    onboardingStep3RegionPlaceholder: 'Mfano: Dar es Salaam',
    onboardingStep3MunicipalPlaceholder: 'Mfano: Kinondoni',
    onboardingStep3WardPlaceholder: 'Mfano: Kijitonyama',
    onboardingStep3NotesLabel: 'Maelezo ya ziada',
    onboardingStep3NotesPlaceholder: 'Mfano: Mtaa wa saba, karibu na duka la dawa...',
    onboardingStep3ValidationLocation: 'Tafadhali chagua Mkoa, Wilaya na Kata.',
    onboardingStep3Save: 'Hifadhi',
    onboardingStep3ManualSubtitle: 'Jaza taarifa za eneo lako kwa usahihi ili wateja wakupate kwa urahisi.',
    onboardingStep3MapSubtitle: 'Buruta pini kwenye ramani kuchagua eneo sahihi la duka lako.',
    onboardingStep3MapMarker: 'Duka Lako',

    onboardingStep4Title: 'Hakiki Taarifa',
    onboardingStep4Subtitle: 'Hakiki taarifa za duka lako kabla ya kuendelea.',
    onboardingStep4Edit: 'Hariri',
    onboardingStep4NotesLabel: 'Maelezo ya ziada',
    onboardingStep4MultiLocationQuestion: 'Una Duka zaidi ya eneo moja?',
    onboardingStep4AddShop: 'Ongeza Duka',

    onboardingStep5Title: 'Hati Za Biashara',
    onboardingStep5Subtitle: 'Ni muhimu kuambatanisha hati za biashara kwa usalama zaidi wa akaunti yako.',
    onboardingStep5CardHeader: 'Pakia taarifa zifuatazo',
    onboardingStep5License: 'Leseni ya Biashara',
    onboardingStep5TIN: 'TIN ya Biashara',
    onboardingStep5BRELA: 'Cheti cha usajili BRELA',
    onboardingStep5UploadPrimary: 'Bonyeza hapa kupakia',
    onboardingStep5UploadSecondary: 'PDF, PNG au JPG (Max 5MB)',
    onboardingStep5UploadSuccess: 'Hati imepakiwa kikamilifu',
    onboardingStep5SkipLater: 'Weka baadae',
    onboardingStep5Wait: 'Subiri...',
    onboardingStep5Uploading: 'Inapakia...',
    onboardingStep5SuccessModalTitle: 'Hongera!',
    onboardingStep5SuccessModalDescription: 'Tumepokea hati zako. Subiri kidogo tunapokagua maelezo katika saa 24 hadi 48 zijazo.',
    onboardingStep5SuccessModalButton: 'Sawa',

    // Login Screen
    loginTitle: "Karibu Tena",
    loginSubtitle: "Ingiza maelezo yako ili uingie",
    loginInputPlaceholder: "Namba ya Simu au Barua Pepe",
    loginPasswordPlaceholder: "Ingiza nenosiri",
    loginForgotPassword: "Umesahau Nenosiri?",
    loginAgreedTerms: "Ninakubali Masharti na Vigezo",
    loginButton: "Ingia",
    loginOrContinue: "au endelea na",
    loginNoAccount: "Huna akaunti? Jisajili",
    loginSkip: "Ruka",
    otpTitle: "Thibitisha & tengeneza nywila",
    otpInstruction: "Ingiza nambari 6 zilizotumwa kwa nambari yako ya simu au barua pepe",
    otpNoCode: "Hukuipokea nambari?",
    otpResend: "Tuma tena",
    otpTimer: "Tuma tena nambari baada ya",
    otpContinue: "Endelea",
    otpInvalidCode: "Nambari Batili",
    otpEnterAllDigits: "Tafadhali ingiza namba zote 6",
    otpVerifyFailed: "Uthibitishaji Umeshindikana",
    forgotPasswordTitle: "Umesahau Nywila",
    forgotPasswordSubtitle: "Huduma ya kurejesha nywila inakuja hivi karibuni.",
    commonLoading: "Inapakia...",
    affiliateRegisterTitle: "Fungua akaunti",
    affiliateLoginTitle: "Karibu tena",
    affiliatePhonePlaceholder: "Weka +255xxx xxx xxx",
    affiliateTermsAgreement: "Nimesoma na kukubaliana na Masharti na Vigezo vya matumizi, sera ya faragha, na sera ya kurejesha ya Tunzaa",
    affiliateRegisterButton: "Fungua Akaunti",
    affiliateNoAccount: "Huna akaunti?",
    affiliateLoginLink: "Ingia",
    affiliateAlreadyAccount: "Tayari una akaunti?",
    // Mauzo Intro
    mauzoHeader: "Mauzo by Tunzaa",
    mauzoSlide1Title: "Usimamizi wa Bidhaa",
    mauzoSlide1Desc: "Tunarahisisha mchakato wa usimamizi wa bidhaa kwa zana zetu rahisi ambapo unaweza kuongeza, kuhariri na kufuta bidhaa kwa urahisi.",
    mauzoSlide2Title: "Usimamizi wa Maagizo",
    mauzoSlide2Desc: "Simamia stoku yako, mauzo na taarifa za wateja mahali pamoja, ili uweze kupata taarifa hizi mahali popote na wakati wowote.",
    mauzoSlide3Title: "Usimamizi wa Pochi",
    mauzoSlide3Desc: "Tumia zana yetu ya usimamizi wa fedha kutoa usimamizi na kudhibiti mtiririko wa pesa wa taasisi ya kifedha.",
    mauzoSlide4Title: "Usimamizi wa Usafirishaji",
    mauzoSlide4Desc: "Inaendeshwa na zana za kidijitali ili kuhakikisha bidhaa zinasafirishwa salama na kwa ufanisi hadi kwa mteja wa mwisho.",
    mauzoCreateAccount: "Fungua akaunti",
    mauzoAlreadyAccount: "Je, tayari una akaunti?",
    mauzoSignIn: "Ingia",
    // Delivery Flow
    deliveryLoginTitle: "Ingia kama Mshirika wa Usafirishaji",
    deliveryPhoneLabel: "Namba ya Simu",
    deliveryPasswordLabel: "Nywila",
    deliverySaveInfo: "Hifadhi Taarifa zangu",
    deliveryForgotPassword: "Umesahau Nywila?",
    deliveryCreateAccount: "Kuwa Mshirika",
    deliverySigningIn: "Inaingia...",
    deliveryContinue: "Endelea",
    deliveryBack: "Rudi",
    deliveryOtpTitle: "Thibitisha Namba",
    deliveryOtpSubtitle: "OTP imetumwa kwenye simu yako",
    deliveryWrongNumber: "Namba ni makosa?",
    deliveryNoOtp: "Hukuipata OTP?",
    deliveryRequestAgain: "Omba tena",
    deliveryVerifying: "Inathibitisha...",
    deliveryVerify: "Thibitisha",
    deliverySuccessLogin: "Umeingia kwa Mafanikio",
    deliverySuccessVerify: "Uthibitishaji Umekamilika",
    deliveryErrorLogin: "Kagua maelezo yako",
    deliveryErrorOtp: "Nambari ya OTP ni batili",
    // Register Screen
    registerTitleBuyer: "Jiunge kama Mnunuzi",
    registerTitleMerchant: "Jiunge kama Muuzaji",
    registerSubtitlePreFilled: "Kagua taarifa zako zilizojazwa",
    registerSubtitleEmpty: "Tafadhali jaza taarifa zako ili kujiunga",
    registerFirstNamePlaceholder: "Jina la Kwanza",
    registerLastNamePlaceholder: "Jina la Pili",
    registerPhoneEmailPlaceholder: "Namba ya Simu",
    registerPasswordPlaceholder: "Nywila",
    registerButton: "Fungua Akaunti",
    registerAlreadyAccount: "Tayari una akaunti? Ingia",
    registerTermsLink: "Masharti na Vigezo",
    // Role Screen
    roleScreenOptionSell: "Uza bidhaa / Huduma",
    roleScreenOptionDelivery: "Toa huduma za usafirishaji",
    roleScreenOptionFinancial: "Toa mikopo na huduma za kifedha",
    roleScreenOptionAffiliate: "Jiunge kama winga",
    roleScreenAlreadyAccount: "Tayari una akaunti?",
    // Common
    commonNext: "Endelea",
    commonBack: "Rudi",
    commonSaving: "Inahifadhi...",
    commonSuccess: "Mafanikio",
    commonError: "Hitilafu",
    commonTryAgain: "Tafadhali jaribu tena",
    // Auth Alerts
    authTermsRequired: "Masharti yanahitajika",
    authTermsRequiredMsg: "Tafadhali kubaliana na Masharti na Vigezo",
    authMissingFields: "Sehemu zinazokosekana",
    authMissingFieldsMsg: "Tafadhali jaza sehemu zote",
    authLoginFailed: "Uingiaji Umeshindikana",
    authLoginFailedMsg: "Hitilafu wakati wa kuingia. Tafadhali kagua maelezo yako.",
    authRegistrationError: "Hitilafu ya Usajili",
    authRegistrationErrorMsg: "Hitilafu wakati wa kufungua akaunti. Tafadhali jaribu tena.",
    authEmailRequired: "Namba ya Simu Inahitajika",
    authEmailRequiredMsg: "Tafadhali tumia namba ya simu kujisajili. Usajili wa barua pepe unahitaji namba ya simu kwa ajili ya kuthibitisha OTP.",
    authSocialLoginError: "Hitilafu ya Uingiaji",
    // Delivery Register
    deliveryRegisterFullNameLabel: "Jina Kamili",
    deliveryRegisterFullNamePlaceholder: "Jeremiah Charles",
    deliveryRegisterNameError: "Tafadhali ingiza angalau majina mawili.",
    // --- Order & Delivery ---
    orderShipped: "Imesafirishwa",
    orderReceived: "Imepokelewa",
    orderReturn: "Rudisha",
    deliveryReviewOrder: "Hakiki agizo lako kabla ya usafirishaji",
    deliveryDropOffLocation: "Eneo la kushusha",
    deliveryNoActive: "Hakuna usafirishaji unaoendelea",
    deliveryEstimatedTime: "Muda wa makadirio ya kufika",
    deliveryStandard: "Kawaida",
    deliveryExpress: "Haraka",
    deliveryPostalAddress: "Anwani ya Posta",
    deliveryDropOffAddress: "Anwani ya Kushushia",
    deliveryCallDriver: "Mpige Dereva",
    deliveryCost: "Gharama ya Usafirishaji",
    deliveryConfirm: "Thibitisha",
    // --- Loans ---
    "vendor.loans.loans_request": "Ombi la Mkopo",
    "vendor.loans.repayments_track": "Fuatilia Marejesho",
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

    settingsTitle: 'Paramètres',
    settingsActivities: 'Vos activités',
    settingsNotifications: 'Notifications in-app',
    settingsReminders: 'Rappels',
    settingsDelivery: 'Commandes de livraison',
    settingsPolicies: 'Politiques',
    settingsAccount: 'Gérer le compte',
    settingsInvite: 'Inviter des amis',
    settingsLanguage: 'Langue',
    settingsLogout: 'Se déconnecter',
    settingsLogoutConfirmTitle: 'Déconnexion',
    settingsLogoutConfirmMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    settingsVersion: 'Version Tunzaa 2.0',

    onboardingStep1Title: 'Documents commerciaux',
    onboardingStep1Subtitle: 'Il est important de joindre des documents commerciaux pour une meilleure sécurité de votre compte.',
    onboardingStep1UploadInfo: 'Téléchargez les informations suivantes',
    onboardingStep1License: 'Licence commerciale',
    onboardingStep1LicensePlaceholder: 'Entrez le numéro de licence',
    onboardingStep1LicenseUpload: 'Télécharger la licence (PDF/Image)',
    onboardingStep1TIN: 'TIN de l\'entreprise',
    onboardingStep1TINPlaceholder: 'Entrez le numéro TIN',
    onboardingStep1TINUpload: 'Télécharger le TIN (PDF/Image)',
    onboardingStep1BRELA: 'Certificat d\'enregistrement BRELA',
    onboardingStep1BRELAPlaceholder: 'Entrez le numéro d\'enregistrement',
    onboardingStep1BRELAUpload: 'Télécharger le certificat (PDF/Image)',
    onboardingStep1Skip: 'Configurer plus tard',
    onboardingStep1Back: 'Retour',
    onboardingStep1Next: 'Continuer',
    onboardingStep1Saving: 'Enregistrement...',

    onboardingStep2Title: 'Détails de la boutique',
    onboardingStep2Subtitle: 'Le logo, le nom de la boutique et sa description sont importants pour créer votre boutique sur Tunzaa.',
    onboardingStep2AddLogo: 'Ajouter un logo*',
    onboardingStep2CompanyName: 'Nom de l\'entreprise',
    onboardingStep2CompanyNamePlaceholder: 'Entrez le nom de l\'entreprise',
    onboardingStep2Phone: 'Numéro de téléphone de la boutique',
    onboardingStep2PhonePlaceholder: 'Exemple : +255 700 000 000',
    onboardingStep2Description: 'Ajouter plus de détails',
    onboardingStep2DescriptionPlaceholder: 'Entrez la description ici',
    onboardingStep2CharLimit: 'Ne doit pas dépasser 240 mots',
    onboardingStep2Required: 'Section requise',
    onboardingStep2PermissionError: 'Désolé, nous avons besoin de la permission d\'accéder à vos photos.',
    onboardingStep2ValidationShopName: 'Veuillez entrer le nom de votre entreprise ou boutique.',

    onboardingStep3Title: 'Emplacement de la boutique',
    onboardingStep3Subtitle: 'Permettez aux clients de suivre facilement les produits en définissant l\'emplacement de votre boutique.',
    onboardingStep3CardTitle: 'Définir l\'emplacement de la boutique',
    onboardingStep3ManualButton: 'Saisir par texte',
    onboardingStep3Or: 'Ou',
    onboardingStep3GPSButton: 'Choisir sur la carte',
    onboardingStep3RegionLabel: 'Région',
    onboardingStep3MunicipalLabel: 'Municipalité',
    onboardingStep3WardLabel: 'Quartier',
    onboardingStep3RegionPlaceholder: 'Exemple : Dar es Salaam',
    onboardingStep3MunicipalPlaceholder: 'Exemple : Kinondoni',
    onboardingStep3WardPlaceholder: 'Exemple : Kijitonyama',
    onboardingStep3NotesLabel: 'Détails supplémentaires',
    onboardingStep3NotesPlaceholder: 'Exemple : Rue 7, près de la pharmacie...',
    onboardingStep3ValidationLocation: 'Veuillez sélectionner la région, la municipalité et le quartier.',
    onboardingStep3Save: 'Enregistrer',
    onboardingStep3ManualSubtitle: 'Remplissez vos informations de localisation avec précision pour que les clients puissent vous trouver facilement.',
    onboardingStep3MapSubtitle: 'Faites glisser l\'épingle sur la carte pour choisir l\'emplacement correct de votre boutique.',
    onboardingStep3MapMarker: 'Votre boutique',

    onboardingStep4Title: 'Réviser les informations',
    onboardingStep4Subtitle: 'Vérifiez les détails de votre boutique avant de continuer.',
    onboardingStep4Edit: 'Modifier',
    onboardingStep4NotesLabel: 'Détails supplémentaires',
    onboardingStep4MultiLocationQuestion: 'Avez-vous plus d\'un emplacement de boutique ?',
    onboardingStep4AddShop: 'Ajouter une boutique',

    onboardingStep5Title: 'Documents commerciaux',
    onboardingStep5Subtitle: 'Il est important de joindre les documents commerciaux pour une sécurité accrue de votre compte.',
    onboardingStep5CardHeader: 'Télécharger les informations suivantes',
    onboardingStep5License: 'Licence commerciale',
    onboardingStep5TIN: 'TIN commercial',
    onboardingStep5BRELA: 'Certificat d\'enregistrement BRELA',
    onboardingStep5UploadPrimary: 'Cliquez ici pour télécharger',
    onboardingStep5UploadSecondary: 'PDF, PNG ou JPG (Max 5MB)',
    onboardingStep5UploadSuccess: 'Document téléchargé avec succès',
    onboardingStep5SkipLater: 'Ajouter plus tard',
    onboardingStep5Wait: 'Attendez...',
    onboardingStep5Uploading: 'Téléchargement...',
    onboardingStep5SuccessModalTitle: 'Félicitations !',
    onboardingStep5SuccessModalDescription: 'Nous avons reçu vos documents. Veuillez patienter un peu pendant que nous examinons les détails dans les 24 à 48 prochaines heures.',
    onboardingStep5SuccessModalButton: 'D\'accord',

    // Login Screen
    loginTitle: "Heureux de vous revoir",
    loginSubtitle: "Entrez vos coordonnées pour vous connecter",
    loginInputPlaceholder: "Numéro de téléphone ou e-mail",
    loginPasswordPlaceholder: "Entrez votre mot de passe",
    loginForgotPassword: "Mot de passe oublié ?",
    loginAgreedTerms: "J'accepte les conditions générales",
    loginButton: "Se connecter",
    loginOrContinue: "ou continuer avec",
    loginNoAccount: "Vous n'avez pas de compte ? S'inscrire",
    loginSkip: "Passer",
    otpTitle: "Vérifier et créer un mot de passe",
    otpInstruction: "Entrez le code à 6 chiffres envoyé à votre numéro de téléphone ou e-mail",
    otpNoCode: "Vous n'avez pas reçu le code ?",
    otpResend: "Renvoyer",
    otpTimer: "Renvoyer le code dans",
    otpContinue: "Continuer",
    otpInvalidCode: "Code Invalide",
    otpEnterAllDigits: "Veuillez entrer les 6 chiffres",
    otpVerifyFailed: "Échec de la vérification",
    forgotPasswordTitle: "Mot de passe oublié",
    forgotPasswordSubtitle: "La fonction de récupération de mot de passe arrive bientôt.",
    mauzoHeader: "Mauzo par Tunzaa",
    mauzoSlide1Title: "Gestion des produits",
    mauzoSlide1Desc: "Nous simplifions le processus de gestion des produits avec nos outils simples où vous pouvez facilement ajouter, modifier et supprimer des produits.",
    mauzoSlide2Title: "Gestion des commandes",
    mauzoSlide2Desc: "Gérez votre stock, vos ventes et les informations de vos clients en un seul endroit, afin de pouvoir accéder facilement à ces données partout et à tout moment.",
    mauzoSlide3Title: "Gestion du portefeuille",
    mauzoSlide3Desc: "Utilisez notre outil de gestion financière pour assurer la surveillance et gérer le flux de trésorerie de l'institution financière.",
    mauzoSlide4Title: "Gestion des livraisons",
    mauzoSlide4Desc: "Propulsé par des outils numériques pour garantir que les produits sont déplacés en toute sécurité et efficacement jusqu'au client final.",
    mauzoCreateAccount: "Créer un compte",
    mauzoAlreadyAccount: "Vous avez déjà un compte ?",
    mauzoSignIn: "Se connecter",
    deliveryLoginTitle: "Se connecter",
    deliveryPhoneLabel: "Numéro de téléphone",
    deliveryPasswordLabel: "Mot de passe",
    deliverySaveInfo: "Enregistrer les informations",
    deliveryForgotPassword: "Mot de passe oublié ?",
    deliveryCreateAccount: "Créer un compte",
    deliverySigningIn: "Connexion en cours...",
    deliveryContinue: "Continuer",
    deliveryBack: "Retour",
    deliveryOtpTitle: "Vérifier le code",
    deliveryOtpSubtitle: "Entrez le code de vérification envoyé au numéro",
    deliveryWrongNumber: "Numéro erroné ?",
    deliveryNoOtp: "Vous n'avez pas reçu le code de vérification ?",
    deliveryRequestAgain: "Demander à nouveau",
    deliveryVerifying: "Vérification en cours...",
    deliveryVerify: "Vérifier",
    deliverySuccessLogin: "Connexion réussie !",
    deliverySuccessVerify: "Vérification terminée ! Veuillez vous connecter.",
    deliveryErrorLogin: "Numéro de téléphone ou mot de passe incorrect",
    deliveryErrorOtp: "Code incorrect",
    // Register Screen
    registerTitleBuyer: "Créer un compte",
    registerTitleMerchant: "Créer un compte professionnel",
    registerSubtitlePreFilled: "Confirmez vos coordonnées et créez un mot de passe",
    registerSubtitleEmpty: "Veuillez remplir vos coordonnées pour commencer",
    registerFirstNamePlaceholder: "Entrez votre prénom",
    registerLastNamePlaceholder: "Entrez votre nom de famille",
    registerPhoneEmailPlaceholder: "Numéro de téléphone",
    registerPasswordPlaceholder: "Créez un mot de passe",
    registerButton: "Créer un compte",
    registerAlreadyAccount: "Vous avez déjà un compte ? Se connecter",
    registerTermsLink: "Conditions générales",

    // Role Screen (additional)
    roleScreenOptionSell: "Vendre des produits / Services",
    roleScreenOptionDelivery: "Fournir des services de livraison",
    roleScreenOptionFinancial: "Offrir des prêts et services financiers",
    roleScreenOptionAffiliate: "Join as winga",
    roleScreenAlreadyAccount: "Vous avez déjà un compte ? Connexion",
    commonNext: "Continuer",
    commonBack: "Retour",
    commonSaving: "Enregistrement...",
    commonSuccess: "Succès !",
    commonError: "Erreur",
    commonTryAgain: "Veuillez réessayer",
    commonLoading: "Chargement...",
    // Auth Alerts
    authTermsRequired: "Terms Required",
    authTermsRequiredMsg: "Please agree to Terms and Conditions",
    authMissingFields: "Missing Fields",
    authMissingFieldsMsg: "Please fill in all fields",
    authLoginFailed: "Login Failed",
    authLoginFailedMsg: "Error signing in. Please check your credentials.",
    authRegistrationError: "Registration Error",
    authRegistrationErrorMsg: "Error creating account. Please try again.",
    authEmailRequired: "Phone Number Required",
    authEmailRequiredMsg: "Please use a phone number to register. Email-based registration requires a phone number for OTP verification.",
    authSocialLoginError: "Login Error",
    // Delivery Register
    deliveryRegisterFullNameLabel: "Full Name",
    deliveryRegisterFullNamePlaceholder: "Jeremiah Charles",
    deliveryRegisterNameError: "Please enter at least two names.",
    orderShipped: "Expédié",
    orderReceived: "Reçu",
    orderReturn: "Retour",
    deliveryReviewOrder: "Vérifiez votre commande avant la livraison",
    deliveryDropOffLocation: "Lieu de dépôt",
    deliveryNoActive: "Pas de livraison active",
    deliveryEstimatedTime: "Heure de livraison estimée",
    deliveryStandard: "Standard",
    deliveryExpress: "Express",
    deliveryPostalAddress: "Adresse postale",
    deliveryDropOffAddress: "Adresse de dépôt",
    deliveryCallDriver: "Appeler le chauffeur",
    deliveryCost: "Frais de livraison",
    deliveryConfirm: "Confirmer",
    // --- Loans ---
    "vendor.loans.loans_request": "Demande de prêt",
    "vendor.loans.repayments_track": "Suivi des remboursements",
};

/** Arabic. */
const ar: TranslationKeys = {
    languageScreenTitle: 'اختر لغتك',
    languageScreenChoosePreferred: 'اختر اللغة المفضلة',
    languageScreenSkip: 'تخطي',
    affiliateRegisterTitle: "Create an account",
    affiliateLoginTitle: "Welcome back",
    affiliatePhonePlaceholder: "Enter +255xxx xxx xxx",
    affiliateTermsAgreement: "I have read agree to Tunzaa Terms and Conditions of use, privacy policy, and return policy",
    affiliateRegisterButton: "Create Account",
    affiliateNoAccount: "Don't have an account?",
    affiliateLoginLink: "Log in",
    affiliateAlreadyAccount: "Already have an account?",

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

    settingsTitle: 'الإعدادات',
    settingsActivities: 'أنشطتك',
    settingsNotifications: 'إشعارات التطبيق',
    settingsReminders: 'التذكيرات',
    settingsDelivery: 'طلبات التوصيل',
    settingsPolicies: 'السياسات',
    settingsAccount: 'إدارة الحساب',
    settingsInvite: 'دعوة الأصدقاء',
    settingsLanguage: 'اللغة',
    settingsLogout: 'تسجيل الخروج',
    settingsLogoutConfirmTitle: 'تسجيل الخروج',
    settingsLogoutConfirmMessage: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    settingsVersion: 'إصدار تنزا 2.0',

    onboardingStep1Title: 'وثائق العمل',
    onboardingStep1Subtitle: 'من المهم إرفاق وثائق العمل لتأمين حسابك بشكل أفضل.',
    onboardingStep1UploadInfo: 'تحميل المعلومات التالية',
    onboardingStep1License: 'رخصة العمل',
    onboardingStep1LicensePlaceholder: 'أدخل رقم الرخصة',
    onboardingStep1LicenseUpload: 'تحميل الرخصة (PDF/صورة)',
    onboardingStep1TIN: 'الرقم الضريبي للعمل',
    onboardingStep1TINPlaceholder: 'أدخل الرقم الضريبي',
    onboardingStep1TINUpload: 'تحميل الرقم الضريبي (PDF/صورة)',
    onboardingStep1BRELA: 'شهادة تسجيل بريلا',
    onboardingStep1BRELAPlaceholder: 'أدخل رقم التسجيل',
    onboardingStep1BRELAUpload: 'تحميل الشهادة (PDF/صورة)',
    onboardingStep1Skip: 'الإعداد لاحقاً',
    onboardingStep1Back: 'رجوع',
    onboardingStep1Next: 'متابعة',
    onboardingStep1Saving: 'جاري الحفظ...',

    onboardingStep2Title: 'تفاصيل المتجر',
    onboardingStep2Subtitle: 'الشعار واسم المتجر ووصف المتجر مهمة لإنشاء متجرك في تنزا.',
    onboardingStep2AddLogo: 'إضافة شعار*',
    onboardingStep2CompanyName: 'اسم الشركة',
    onboardingStep2CompanyNamePlaceholder: 'أدخل اسم الشركة',
    onboardingStep2Phone: 'رقم هاتف المتجر',
    onboardingStep2PhonePlaceholder: 'مثال: +000 000 700 255',
    onboardingStep2Description: 'أضف المزيد من التفاصيل',
    onboardingStep2DescriptionPlaceholder: 'أدخل الوصف هنا',
    onboardingStep2CharLimit: 'يجب ألا يتجاوز 240 كلمة',
    onboardingStep2Required: 'قسم مطلوب',
    onboardingStep2PermissionError: 'عذرًا، نحتاج إلى إذن للوصول إلى صورك.',
    onboardingStep2ValidationShopName: 'يرجى إدخال اسم شركتك أو متجرك.',

    onboardingStep3Title: 'موقع المتجر',
    onboardingStep3Subtitle: 'تمكين العملاء من متابعة المنتجات بسهولة عن طريق تحديد موقع متجرك.',
    onboardingStep3CardTitle: 'تحديد موقع المتجر',
    onboardingStep3ManualButton: 'الإدخال باستخدام النص',
    onboardingStep3Or: 'أو',
    onboardingStep3GPSButton: 'اختر على الخريطة',
    onboardingStep3RegionLabel: 'المنطقة',
    onboardingStep3MunicipalLabel: 'البلدية',
    onboardingStep3WardLabel: 'الحي',
    onboardingStep3RegionPlaceholder: 'مثال: دار السلام',
    onboardingStep3MunicipalPlaceholder: 'مثال: كينوندوني',
    onboardingStep3WardPlaceholder: 'مثال: كيجيتونياما',
    onboardingStep3NotesLabel: 'تفاصيل إضافية',
    onboardingStep3NotesPlaceholder: 'مثال: شارع 7، بالقرب من الصيدلية...',
    onboardingStep3ValidationLocation: 'يرجى اختيار المنطقة والبلدية والحي.',
    onboardingStep3Save: 'حفظ',
    onboardingStep3ManualSubtitle: 'املأ معلومات موقعك بدقة حتى يتمكن العملاء من العثور عليك بسهولة.',
    onboardingStep3MapSubtitle: 'اسحب الدبوس على الخريطة لاختيار الموقع الصحيح لمتجرك.',
    onboardingStep3MapMarker: 'متجرك',

    onboardingStep4Title: 'مراجعة المعلومات',
    onboardingStep4Subtitle: 'راجع تفاصيل متجرك قبل المتابعة.',
    onboardingStep4Edit: 'تعديل',
    onboardingStep4NotesLabel: 'تفاصيل إضافية',
    onboardingStep4MultiLocationQuestion: 'هل لديك أكثر من موقع متجر واحد؟',
    onboardingStep4AddShop: 'إضافة متجر',

    onboardingStep5Title: 'وثائق العمل',
    onboardingStep5Subtitle: 'من المهم إرفاق وثائق العمل لمزيد من الأمان لحسابك.',
    onboardingStep5CardHeader: 'تحميل المعلومات التالية',
    onboardingStep5License: 'رخصة تجارية',
    onboardingStep5TIN: 'رقم التعريف الضريبي للعمل',
    onboardingStep5BRELA: 'شهادة تسجيل بريلا',
    onboardingStep5UploadPrimary: 'انقر هنا للتحميل',
    onboardingStep5UploadSecondary: 'PDF أو PNG أو JPG (بحد أقصى 5 ميجابايت)',
    onboardingStep5UploadSuccess: 'تم تحميل المستند بنجاح',
    onboardingStep5SkipLater: 'إضافة لاحقاً',
    onboardingStep5Wait: 'انتظر...',
    onboardingStep5Uploading: 'جاري التحميل...',
    onboardingStep5SuccessModalTitle: 'تهانينا!',
    onboardingStep5SuccessModalDescription: 'لقد استلمنا وثائقك. يرجى الانتظار قليلاً بينما نراجع التفاصيل في غضون 24 إلى 48 ساعة القادمة.',
    onboardingStep5SuccessModalButton: 'حسنًا',

    // Login Screen
    loginTitle: "مرحباً بعودتك",
    loginSubtitle: "أدخل بياناتك لتسجيل الدخول",
    loginInputPlaceholder: "رقم الهاتف أو البريد الإلكتروني",
    loginPasswordPlaceholder: "أدخل كلمة المرور",
    loginForgotPassword: "هل نسيت كلمة المرور؟",
    loginAgreedTerms: "أنا أوافق على الشروط والأحكام",
    loginButton: "تسجيل الدخول",
    loginOrContinue: "أو الاستمرار باستخدام",
    loginNoAccount: "ليس لديك حساب؟ سجل الآن",
    loginSkip: "تخطي",
    otpTitle: "التحقق وإنشاء كلمة مرور",
    otpInstruction: "أدخل الرمز المكون من 6 أرقام المرسل إلى رقم هاتفك أو بريدك الإلكتروني",
    otpNoCode: "لم تستلم الرمز؟",
    otpResend: "إعادة إرسال",
    otpTimer: "إعادة إرسال الرمز خلال",
    otpContinue: "استمرار",
    otpInvalidCode: "رمز غير صالح",
    otpEnterAllDigits: "يرجى إدخال جميع الأرقام الستة",
    otpVerifyFailed: "فشل التحقق",
    forgotPasswordTitle: "هل نسيت كلمة المرور",
    forgotPasswordSubtitle: "ميزة استعادة كلمة المرور ستتوفر قريبًا.",
    mauzoHeader: "Mauzo من Tunzaa",
    mauzoSlide1Title: "إدارة المنتجات",
    mauzoSlide1Desc: "نحن نبسط عملية إدارة المنتجات من خلال أدواتنا البسيطة حيث يمكنك بسهولة إضافة المنتجات وتعديلها وحذفها.",
    mauzoSlide2Title: "إدارة الطلبات",
    mauzoSlide2Desc: "قم بإدارة مخزونك ومبيعاتك ومعلومات عملائك في مكان واحد، حتى تتمكن من الوصول بسهولة إلى هذه البيانات في أي مكان وفي أي وقت.",
    mauzoSlide3Title: "إدارة المحفظة",
    mauzoSlide3Desc: "استخدم أداة الإدارة المالية لدينا لضمان الرقابة والتعامل مع التدفق النقدي للمؤسسة المالية.",
    mauzoSlide4Title: "إدارة التسليم",
    mauzoSlide4Desc: "مدفوعة بالأدوات الرقمية لضمان نقل المنتجات بأمان وكفاءة حتى تصل إلى العميل النهائي.",
    mauzoCreateAccount: "إنشاء حساب",
    mauzoAlreadyAccount: "هل لديك حساب بالفعل؟",
    mauzoSignIn: "تسجيل الدخول",
    deliveryLoginTitle: "تسجيل الدخول",
    deliveryPhoneLabel: "رقم الهاتف",
    deliveryPasswordLabel: "كلمة المرور",
    deliverySaveInfo: "حفظ المعلومات",
    deliveryForgotPassword: "هل نسيت كلمة المرور؟",
    deliveryCreateAccount: "إنشاء حساب",
    deliverySigningIn: "جاري تسجيل الدخول...",
    deliveryContinue: "استمرار",
    deliveryBack: "رجوع",
    deliveryOtpTitle: "تحقق من الرمز",
    deliveryOtpSubtitle: "أدخل رمز التحقق المرسل إلى الرقم",
    deliveryWrongNumber: "رقم خاطئ؟",
    deliveryNoOtp: "لم تستلم رمز التحقق؟",
    deliveryRequestAgain: "طلب مرة أخرى",
    deliveryVerifying: "جاري التحقق...",
    deliveryVerify: "تحقق",
    deliverySuccessLogin: "تم تسجيل الدخول بنجاح!",
    deliverySuccessVerify: "اكتمل التحقق! يرجى تسجيل الدخول.",
    deliveryErrorLogin: "رقم الهاتف أو كلمة المرور غير صحيحة",
    deliveryErrorOtp: "رمز غير صحيح",
    // Register Screen
    registerTitleBuyer: "إنشاء حساب",
    registerTitleMerchant: "إنشاء حساب تجاري",
    registerSubtitlePreFilled: "تأكيد بياناتك وإنشاء كلمة مرور",
    registerSubtitleEmpty: "يرجى ملء بياناتك للبدء",
    registerFirstNamePlaceholder: "أدخل اسمك الأول",
    registerLastNamePlaceholder: "أدخل اسمك الثاني",
    registerPhoneEmailPlaceholder: "رقم الهاتف",
    registerPasswordPlaceholder: "إنشاء كلمة مرور",
    registerButton: "إنشاء حساب",
    registerAlreadyAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    registerTermsLink: "الشروط والأحكام",

    // Role Screen (additional)
    roleScreenOptionSell: "بيع المنتجات / الخدمات",
    roleScreenOptionDelivery: "تقديم خدمات التوصيل",
    roleScreenOptionFinancial: "تقديم القروض والخدمات المالية",
    roleScreenOptionAffiliate: "الانضمام كمسوق بالعمولة",
    roleScreenAlreadyAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    commonNext: "متابعة",
    commonBack: "رجوع",
    commonSaving: "جari الحفظ...",
    commonSuccess: "تم بنجاح!",
    commonError: "خطأ",
    commonTryAgain: "يرجى المحاولة مرة أخرى",
    commonLoading: "جاري التحميل...",
    // Auth Alerts
    authTermsRequired: "Terms Required",
    authTermsRequiredMsg: "Please agree to Terms and Conditions",
    authMissingFields: "Missing Fields",
    authMissingFieldsMsg: "Please fill in all fields",
    authLoginFailed: "Login Failed",
    authLoginFailedMsg: "Error signing in. Please check your credentials.",
    authRegistrationError: "Registration Error",
    authRegistrationErrorMsg: "Error creating account. Please try again.",
    authEmailRequired: "Phone Number Required",
    authEmailRequiredMsg: "Please use a phone number to register. Email-based registration requires a phone number for OTP verification.",
    authSocialLoginError: "Login Error",
    // Delivery Register
    deliveryRegisterFullNameLabel: "Full Name",
    deliveryRegisterFullNamePlaceholder: "Jeremiah Charles",
    deliveryRegisterNameError: "Please enter at least two names.",
    orderShipped: "تم الشحن",
    orderReceived: "تم الاستلام",
    orderReturn: "إرجاع",
    deliveryReviewOrder: "راجع طلبك قبل التوصيل",
    deliveryDropOffLocation: "موقع التسليم",
    deliveryNoActive: "لا يوجد توصيل نشط",
    deliveryEstimatedTime: "وقت التوصيل المتوقع",
    deliveryStandard: "قياسي",
    deliveryExpress: "سريع",
    deliveryPostalAddress: "العنوان البريدي",
    deliveryDropOffAddress: "عنوان التسليم",
    deliveryCallDriver: "اتصل بالسائق",
    deliveryCost: "تكلفة التوصيل",
    deliveryConfirm: "تأكيد",
    // --- Loans ---
    "vendor.loans.loans_request": "طلب قرض",
    "vendor.loans.repayments_track": "تتبع السداد",
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

    settingsTitle: 'Ajustes',
    settingsActivities: 'Tus actividades',
    settingsNotifications: 'Notificaciones en la aplicación',
    settingsReminders: 'Recordatorios',
    settingsDelivery: 'Pedidos de entrega',
    settingsPolicies: 'Políticas',
    settingsAccount: 'Gestionar cuenta',
    settingsInvite: 'Invitar amigos',
    settingsLanguage: 'Idioma',
    settingsLogout: 'Cerrar sesión',
    settingsLogoutConfirmTitle: 'Cerrar sesión',
    settingsLogoutConfirmMessage: '¿Estás seguro de que quieres cerrar sesión?',
    settingsVersion: 'Versión Tunzaa 2.0',

    onboardingStep1Title: 'Documentos comerciales',
    onboardingStep1Subtitle: 'Es importante adjuntar documentos comerciales para una mejor seguridad de su cuenta.',
    onboardingStep1UploadInfo: 'Sube la siguiente información',
    onboardingStep1License: 'Licencia comercial',
    onboardingStep1LicensePlaceholder: 'Ingrese el número de licencia',
    onboardingStep1LicenseUpload: 'Subir licencia (PDF/Imagen)',
    onboardingStep1TIN: 'TIN de la empresa',
    onboardingStep1TINPlaceholder: 'Ingrese el número TIN',
    onboardingStep1TINUpload: 'Subir TIN (PDF/Imagen)',
    onboardingStep1BRELA: 'Certificado de registro BRELA',
    onboardingStep1BRELAPlaceholder: 'Ingrese el número de registro',
    onboardingStep1BRELAUpload: 'Subir certificado (PDF/Imagen)',
    onboardingStep1Skip: 'Configurar más tarde',
    onboardingStep1Back: 'Volver',
    onboardingStep1Next: 'Continuar',
    onboardingStep1Saving: 'Guardando...',

    onboardingStep2Title: 'Detalles de la tienda',
    onboardingStep2Subtitle: 'El logo, el nombre de la tienda y la descripción de la tienda son importantes al crear su tienda en Tunzaa.',
    onboardingStep2AddLogo: 'Añadir logo*',
    onboardingStep2CompanyName: 'Nombre de la empresa',
    onboardingStep2CompanyNamePlaceholder: 'Ingrese el nombre de la empresa',
    onboardingStep2Phone: 'Número de teléfono de la tienda',
    onboardingStep2PhonePlaceholder: 'Ejemplo: +255 700 000 000',
    onboardingStep2Description: 'Añadir más detalles',
    onboardingStep2DescriptionPlaceholder: 'Ingrese la descripción aquí',
    onboardingStep2CharLimit: 'No debe exceder las 240 palabras',
    onboardingStep2Required: 'Sección requerida',
    onboardingStep2PermissionError: 'Lo sentimos, necesitamos permiso para acceder a sus fotos.',
    onboardingStep2ValidationShopName: 'Por favor, ingrese el nombre de su empresa o tienda.',

    onboardingStep3Title: 'Ubicación de la tienda',
    onboardingStep3Subtitle: 'Permita que los clientes sigan los productos fácilmente estableciendo la ubicación de su tienda.',
    onboardingStep3CardTitle: 'Establecer ubicación de la tienda',
    onboardingStep3ManualButton: 'Ingresar mediante texto',
    onboardingStep3Or: 'O',
    onboardingStep3GPSButton: 'Elegir en el mapa',
    onboardingStep3RegionLabel: 'Región',
    onboardingStep3MunicipalLabel: 'Municipio',
    onboardingStep3WardLabel: 'Barrio',
    onboardingStep3RegionPlaceholder: 'Ejemplo: Dar es Salaam',
    onboardingStep3MunicipalPlaceholder: 'Ejemplo: Kinondoni',
    onboardingStep3WardPlaceholder: 'Ejemplo: Kijitonyama',
    onboardingStep3NotesLabel: 'Detalles adicionales',
    onboardingStep3NotesPlaceholder: 'Ejemplo: Calle 7, cerca de la farmacia...',
    onboardingStep3ValidationLocation: 'Por favor, seleccione Región, Municipio y Barrio.',
    onboardingStep3Save: 'Guardar',
    onboardingStep3ManualSubtitle: 'Complete la información de su ubicación con precisión para que los clientes puedan encontrarlo fácilmente.',
    onboardingStep3MapSubtitle: 'Arrastre el pin en el mapa para elegir la ubicación correcta de su tienda.',
    onboardingStep3MapMarker: 'Su tienda',

    onboardingStep4Title: 'Revisar información',
    onboardingStep4Subtitle: 'Revise los detalles de su tienda antes de continuar.',
    onboardingStep4Edit: 'Editar',
    onboardingStep4NotesLabel: 'Detalles adicionales',
    onboardingStep4MultiLocationQuestion: '¿Tiene más de una ubicación de tienda?',
    onboardingStep4AddShop: 'Añadir tienda',

    onboardingStep5Title: 'Documentos comerciales',
    onboardingStep5Subtitle: 'Es importante adjuntar documentos comerciales para mayor seguridad de su cuenta.',
    onboardingStep5CardHeader: 'Subir la siguiente información',
    onboardingStep5License: 'Licencia comercial',
    onboardingStep5TIN: 'TIN comercial',
    onboardingStep5BRELA: 'Certificado de registro BRELA',
    onboardingStep5UploadPrimary: 'Haga clic aquí para subir',
    onboardingStep5UploadSecondary: 'PDF, PNG o JPG (Máx 5MB)',
    onboardingStep5UploadSuccess: 'Documento subido con éxito',
    onboardingStep5SkipLater: 'Añadir más tarde',
    onboardingStep5Wait: 'Espere...',
    onboardingStep5Uploading: 'Subiendo...',
    onboardingStep5SuccessModalTitle: '¡Felicidades!',
    onboardingStep5SuccessModalDescription: 'Hemos recibido sus documentos. Espere un poco mientras revisamos los detalles en las próximas 24 a 48 horas.',
    onboardingStep5SuccessModalButton: 'De acuerdo',

    // Login Screen
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Ingrese sus datos para iniciar sesión",
    loginInputPlaceholder: "Número de teléfono o correo",
    loginPasswordPlaceholder: "Ingrese contraseña",
    loginForgotPassword: "¿Olvidó su contraseña?",
    loginAgreedTerms: "Acepto los Términos y Condiciones",
    loginButton: "Iniciar sesión",
    loginOrContinue: "o continuar con",
    loginNoAccount: "¿No tiene cuenta? Regístrese",
    loginSkip: "Saltar",
    otpTitle: "Verificar y crear contraseña",
    otpInstruction: "Ingrese el código de 6 dígitos enviado a su número de teléfono o correo electrónico",
    otpNoCode: "¿No recibió el código?",
    otpResend: "Reenviar",
    otpTimer: "Reenviar código en",
    otpContinue: "Continuar",
    otpInvalidCode: "Código Inválido",
    otpEnterAllDigits: "Por favor ingrese los 6 dígitos",
    otpVerifyFailed: "Verificación Fallida",
    forgotPasswordTitle: "Olvidé mi contraseña",
    forgotPasswordSubtitle: "La función de recuperación de contraseña estará disponible pronto.",
    mauzoHeader: "Mauzo por Tunzaa",
    mauzoSlide1Title: "Gestión de productos",
    mauzoSlide1Desc: "Simplificamos el proceso de gestión de productos con nuestras herramientas sencillas donde puede agregar, editar y eliminar productos fácilmente.",
    mauzoSlide2Title: "Gestión de pedidos",
    mauzoSlide2Desc: "Gestione su stock, ventas e información de clientes en un solo lugar, para que pueda acceder fácilmente a estos datos en cualquier lugar y en cualquier momento.",
    mauzoSlide3Title: "Gestión de billetera",
    mauzoSlide3Desc: "Utilice nuestra herramienta de gestión financiera para garantizar la supervisión y manejar el flujo de caja de la institución financiera.",
    mauzoSlide4Title: "Gestión de entregas",
    mauzoSlide4Desc: "Impulsado por herramientas digitales para garantizar que los productos se muevan de forma segura y eficiente hasta que lleguen al cliente final.",
    mauzoCreateAccount: "Crear una cuenta",
    mauzoAlreadyAccount: "¿Ya tienes una cuenta?",
    mauzoSignIn: "Iniciar sesión",
    deliveryLoginTitle: "Iniciar sesión",
    deliveryPhoneLabel: "Número de teléfono",
    deliveryPasswordLabel: "Contraseña",
    deliverySaveInfo: "Guardar información",
    deliveryForgotPassword: "¿Olvidó su contraseña?",
    deliveryCreateAccount: "Crear cuenta",
    deliverySigningIn: "Iniciando sesión...",
    deliveryContinue: "Continuar",
    deliveryBack: "Volver",
    deliveryOtpTitle: "Verificar código",
    deliveryOtpSubtitle: "Ingrese el código de verificación enviado al número",
    deliveryWrongNumber: "¿Número incorrecto?",
    deliveryNoOtp: "¿No recibió el código de verificación?",
    deliveryRequestAgain: "Solicitar de nuevo",
    deliveryVerifying: "Verificando...",
    deliveryVerify: "Verificar",
    deliverySuccessLogin: "¡Sesión iniciada con éxito!",
    deliverySuccessVerify: "¡Verificación completa! Por favor inicie sesión.",
    deliveryErrorLogin: "El número de teléfono o la contraseña son incorrectos",
    deliveryErrorOtp: "Código incorrecto",
    // Register Screen
    registerTitleBuyer: "Crear una cuenta",
    registerTitleMerchant: "Crear cuenta de negocios",
    registerSubtitlePreFilled: "Confirme sus datos y cree una contraseña",
    registerSubtitleEmpty: "Por favor, complete sus datos para comenzar",
    registerFirstNamePlaceholder: "Ingrese su primer nombre",
    registerLastNamePlaceholder: "Ingrese su segundo nombre",
    registerPhoneEmailPlaceholder: "Número de teléfono",
    registerPasswordPlaceholder: "Cree una contraseña",
    registerButton: "Crear cuenta",
    registerAlreadyAccount: "¿Ya tiene una cuenta? Inicie sesión",
    registerTermsLink: "Términos y Condiciones",

    // Role Screen (additional)
    roleScreenOptionSell: "Vender productos / Servicios",
    roleScreenOptionDelivery: "Proporcionar servicios de entrega",
    roleScreenOptionFinancial: "Ofrecer préstamos y servicios financieros",
    roleScreenOptionAffiliate: "Unirse como comercializador afiliado",
    roleScreenAlreadyAccount: "¿Ya tiene una cuenta? Iniciar sesión",
    // Common
    commonNext: "Siguiente",
    commonBack: "Volver",
    commonSaving: "Guardando...",
    commonSuccess: "Éxito",
    commonError: "Error",
    commonTryAgain: "Por favor, inténtelo de nuevo",
    commonLoading: "Cargando...",
    // Auth Alerts
    authTermsRequired: "Términos requeridos",
    authTermsRequiredMsg: "Por favor, acepte los términos y condiciones",
    authMissingFields: "Campos faltantes",
    authMissingFieldsMsg: "Por favor, complete todos los campos",
    authLoginFailed: "Error al iniciar sesión",
    authLoginFailedMsg: "Error al iniciar sesión. Por favor, compruebe sus credenciales.",
    authRegistrationError: "Error de registro",
    authRegistrationErrorMsg: "Error al crear la cuenta. Por favor, inténtelo de nuevo.",
    authEmailRequired: "Número de teléfono requerido",
    authEmailRequiredMsg: "Por favor, use un número de teléfono para registrarse. El registro por correo electrónico requiere un número de teléfono para la verificación OTP.",
    authSocialLoginError: "Error de inicio de sesión",
    // Delivery Register
    deliveryRegisterFullNameLabel: "Nombre completo",
    deliveryRegisterFullNamePlaceholder: "Jeremiah Charles",
    deliveryRegisterNameError: "Por favor, ingrese al menos dos nombres.",
    orderShipped: "Enviado",
    orderReceived: "Recibido",
    orderReturn: "Devolver",
    deliveryReviewOrder: "Revise su pedido antes de la entrega",
    deliveryDropOffLocation: "Lugar de entrega",
    deliveryNoActive: "No hay entrega activa",
    deliveryEstimatedTime: "Tiempo de entrega estimado",
    deliveryStandard: "Estándar",
    deliveryExpress: "Exprés",
    deliveryPostalAddress: "Dirección postal",
    deliveryDropOffAddress: "Dirección de entrega",
    deliveryCallDriver: "Llamar al conductor",
    deliveryCost: "Costo de envío",
    deliveryConfirm: "Confirmar",
    // --- Loans ---
    "vendor.loans.loans_request": "Solicitud de préstamo",
    "vendor.loans.repayments_track": "Seguimiento de pagos",
};

/** Portuguese. */
const pt: TranslationKeys = {
    languageScreenTitle: 'Escolha o seu idioma',
    languageScreenChoosePreferred: 'Escolher idioma preferido',
    languageScreenSkip: 'Pular',
    affiliateRegisterTitle: "Create an account",
    affiliateLoginTitle: "Welcome back",
    affiliatePhonePlaceholder: "Enter +255xxx xxx xxx",
    affiliateTermsAgreement: "I have read agree to Tunzaa Terms and Conditions of use, privacy policy, and return policy",
    affiliateRegisterButton: "Create Account",
    affiliateNoAccount: "Don't have an account?",
    affiliateLoginLink: "Log in",
    affiliateAlreadyAccount: "Already have an account?",

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

    settingsTitle: 'Configurações',
    settingsActivities: 'Suas atividades',
    settingsNotifications: 'Notificações no aplicativo',
    settingsReminders: 'Lembretes',
    settingsDelivery: 'Pedidos de entrega',
    settingsPolicies: 'Políticas',
    settingsAccount: 'Gerenciar conta',
    settingsInvite: 'Convidar amigos',
    settingsLanguage: 'Idioma',
    settingsLogout: 'Sair',
    settingsLogoutConfirmTitle: 'Sair',
    settingsLogoutConfirmMessage: 'Tem certeza de que deseja sair?',
    settingsVersion: 'Versão Tunzaa 2.0',

    onboardingStep1Title: 'Documentos comerciais',
    onboardingStep1Subtitle: 'É importante anexar documentos comerciais para uma melhor segurança da sua conta.',
    onboardingStep1UploadInfo: 'Carregue as seguintes informações',
    onboardingStep1License: 'Alvará comercial',
    onboardingStep1LicensePlaceholder: 'Digite o número do alvará',
    onboardingStep1LicenseUpload: 'Carregar alvará (PDF/Imagem)',
    onboardingStep1TIN: 'TIN da empresa',
    onboardingStep1TINPlaceholder: 'Digite o número TIN',
    onboardingStep1TINUpload: 'Carregar TIN (PDF/Imagem)',
    onboardingStep1BRELA: 'Certificado de registro BRELA',
    onboardingStep1BRELAPlaceholder: 'Digite o número de registro',
    onboardingStep1BRELAUpload: 'Carregar certificado (PDF/Imagem)',
    onboardingStep1Skip: 'Configurar mais tarde',
    onboardingStep1Back: 'Voltar',
    onboardingStep1Next: 'Continuar',
    onboardingStep1Saving: 'Salvando...',

    onboardingStep2Title: 'Detalhes da loja',
    onboardingStep2Subtitle: 'Logotipo, nome da loja e descrição da loja são importantes na criação da sua loja no Tunzaa.',
    onboardingStep2AddLogo: 'Adicionar logotipo*',
    onboardingStep2CompanyName: 'Nome da empresa',
    onboardingStep2CompanyNamePlaceholder: 'Digite o nome da empresa',
    onboardingStep2Phone: 'Número de telefone da loja',
    onboardingStep2PhonePlaceholder: 'Exemplo: +255 700 000 000',
    onboardingStep2Description: 'Adicionar mais detalhes',
    onboardingStep2DescriptionPlaceholder: 'Digite a descrição aqui',
    onboardingStep2CharLimit: 'Não deve exceder 240 palavras',
    onboardingStep2Required: 'Seção obrigatória',
    onboardingStep2PermissionError: 'Desculpe, precisamos de permissão para acessar suas fotos.',
    onboardingStep2ValidationShopName: 'Por favor, digite o nome da sua empresa ou loja.',

    onboardingStep3Title: 'Localização da loja',
    onboardingStep3Subtitle: 'Permita que os clientes acompanhem os produtos facilmente configurando a localização da sua loja.',
    onboardingStep3CardTitle: 'Definir localização da loja',
    onboardingStep3ManualButton: 'Inserir por texto',
    onboardingStep3Or: 'Ou',
    onboardingStep3GPSButton: 'Escolher no mapa',
    onboardingStep3RegionLabel: 'Região',
    onboardingStep3MunicipalLabel: 'Município',
    onboardingStep3WardLabel: 'Bairro',
    onboardingStep3RegionPlaceholder: 'Exemplo: Dar es Salaam',
    onboardingStep3MunicipalPlaceholder: 'Exemplo: Kinondoni',
    onboardingStep3WardPlaceholder: 'Exemplo: Kijitonyama',
    onboardingStep3NotesLabel: 'Detalhes adicionais',
    onboardingStep3NotesPlaceholder: 'Exemplo: Rua 7, perto da farmácia...',
    onboardingStep3ValidationLocation: 'Por favor, selecione Região, Município e Bairro.',
    onboardingStep3Save: 'Salvar',
    onboardingStep3ManualSubtitle: 'Preencha suas informações de localização com precisão para que os clientes possam encontrá-lo facilmente.',
    onboardingStep3MapSubtitle: 'Arraste o pino no mapa para escolher a localização correta da sua loja.',
    onboardingStep3MapMarker: 'Sua loja',

    onboardingStep4Title: 'Revisar informações',
    onboardingStep4Subtitle: 'Revise os detalhes da sua loja antes de continuar.',
    onboardingStep4Edit: 'Editar',
    onboardingStep4NotesLabel: 'Detalhes adicionais',
    onboardingStep4MultiLocationQuestion: 'Você tem mais de um local de loja?',
    onboardingStep4AddShop: 'Adicionar loja',

    onboardingStep5Title: 'Documentos comerciais',
    onboardingStep5Subtitle: 'É importante anexar documentos comerciais para maior segurança da sua conta.',
    onboardingStep5CardHeader: 'Carregar as seguintes informações',
    onboardingStep5License: 'Licença comercial',
    onboardingStep5TIN: 'TIN comercial',
    onboardingStep5BRELA: 'Certificado de registro BRELA',
    onboardingStep5UploadPrimary: 'Clique aqui para carregar',
    onboardingStep5UploadSecondary: 'PDF, PNG ou JPG (Máx 5MB)',
    onboardingStep5UploadSuccess: 'Documento carregado com sucesso',
    onboardingStep5SkipLater: 'Adicionar mais tarde',
    onboardingStep5Wait: 'Aguarde...',
    onboardingStep5Uploading: 'Carregando...',
    onboardingStep5SuccessModalTitle: 'Parabéns!',
    onboardingStep5SuccessModalDescription: 'Recebemos seus documentos. Aguarde um pouco enquanto revisamos os detalhes nas próximas 24 a 48 horas.',
    onboardingStep5SuccessModalButton: 'Ok',

    // Login Screen
    loginTitle: "Bem-vindo de volta",
    loginSubtitle: "Insira seus dados para entrar",
    loginInputPlaceholder: "Número de telefone ou e-mail",
    loginPasswordPlaceholder: "Insira a senha",
    loginForgotPassword: "Esqueceu a senha?",
    loginAgreedTerms: "Eu concordo com os Termos e Condições",
    loginButton: "Entrar",
    loginOrContinue: "ou continuar com",
    loginNoAccount: "Não tem uma conta? Cadastre-se",
    loginSkip: "Pular",
    otpTitle: "Verificar e criar senha",
    otpInstruction: "Insira o código de 6 dígitos enviado para seu número de telefone ou e-mail",
    otpNoCode: "Não recebeu o código?",
    otpResend: "Reenviar",
    otpTimer: "Reenviar código em",
    otpContinue: "Continuar",
    otpInvalidCode: "Código Inválido",
    otpEnterAllDigits: "Por favor insira todos os 6 dígitos",
    otpVerifyFailed: "Falha na Verificação",
    forgotPasswordTitle: "Esqueci a senha",
    forgotPasswordSubtitle: "O recurso de recuperação de senha estará disponível em breve.",
    mauzoHeader: "Mauzo por Tunzaa",
    mauzoSlide1Title: "Gestão de Produtos",
    mauzoSlide1Desc: "Simplificamos o processo de gestão de produtos com as nossas ferramentas simples, onde pode facilmente adicionar, editar e eliminar produtos.",
    mauzoSlide2Title: "Gestão de Pedidos",
    mauzoSlide2Desc: "Gerencie seu estoque, vendas e informações de clientes em um só lugar, para que você possa acessar facilmente esses dados em qualquer lugar e a qualquer hora.",
    mauzoSlide3Title: "Gestão de Carteira",
    mauzoSlide3Desc: "Utilize a nossa ferramenta de gestão financeira para garantir a supervisão e lidar com o fluxo de caixa da instituição financeira.",
    mauzoSlide4Title: "Gestão de Entregas",
    mauzoSlide4Desc: "Impulsionado por ferramentas digitais para garantir que os produtos sejam movidos com segurança e eficiência até chegarem ao cliente final.",
    mauzoCreateAccount: "Criar uma conta",
    mauzoAlreadyAccount: "Já tem uma conta?",
    mauzoSignIn: "Entrar",
    deliveryLoginTitle: "Entrar",
    deliveryPhoneLabel: "Número de telefone",
    deliveryPasswordLabel: "Senha",
    deliverySaveInfo: "Salvar informações",
    deliveryForgotPassword: "Esqueceu a senha?",
    deliveryCreateAccount: "Criar conta",
    deliverySigningIn: "Entrando...",
    deliveryContinue: "Continuar",
    deliveryBack: "Voltar",
    deliveryOtpTitle: "Verificar código",
    deliveryOtpSubtitle: "Insira o código de verificação enviado para o número",
    deliveryWrongNumber: "Número errado?",
    deliveryNoOtp: "Não recebeu o código de verificação?",
    deliveryRequestAgain: "Solicitar novamente",
    deliveryVerifying: "Verificando...",
    deliveryVerify: "Verificar",
    deliverySuccessLogin: "Login realizado com sucesso!",
    deliverySuccessVerify: "Verificação concluída! Por favor, faça o login.",
    deliveryErrorLogin: "Número de telefone ou senha incorretos",
    deliveryErrorOtp: "Código incorreto",
    // Register Screen
    registerTitleBuyer: "Criar uma conta",
    registerTitleMerchant: "Criar conta comercial",
    registerSubtitlePreFilled: "Confirme seus dados e crie uma senha",
    registerSubtitleEmpty: "Por favor, preencha seus dados para começar",
    registerFirstNamePlaceholder: "Insira seu primeiro nome",
    registerLastNamePlaceholder: "Insira seu sobrenome",
    registerPhoneEmailPlaceholder: "Número de telefone",
    registerPasswordPlaceholder: "Crie uma senha",
    registerButton: "Criar conta",
    registerAlreadyAccount: "Já tem uma conta? Entrar",
    registerTermsLink: "Termos e Condições",

    // Role Screen (additional)
    roleScreenOptionSell: "Vender produtos / Serviços",
    roleScreenOptionDelivery: "Fornecer serviços de entrega",
    roleScreenOptionFinancial: "Oferecer empréstimos e serviços financeiros",
    roleScreenOptionAffiliate: "Junte-se como profissional de marketing afiliado",
    roleScreenAlreadyAccount: "Já tem uma conta? Entrar",
    // Common
    commonNext: "Próximo",
    commonBack: "Voltar",
    commonSaving: "Salvando...",
    commonSuccess: "Sucesso",
    commonError: "Erro",
    commonTryAgain: "Por favor, tente novamente",
    commonLoading: "Carregando...",
    // Auth Alerts
    authTermsRequired: "Termos obrigatórios",
    authTermsRequiredMsg: "Por favor, concorde com os termos e condições",
    authMissingFields: "Campos em falta",
    authMissingFieldsMsg: "Por favor, preencha todos os campos",
    authLoginFailed: "Falha no login",
    authLoginFailedMsg: "Erro ao iniciar sessão. Por favor, verifique as suas credenciais.",
    authRegistrationError: "Erro de registro",
    authRegistrationErrorMsg: "Erro ao criar conta. Por favor, tente novamente.",
    authEmailRequired: "Número de telefone obrigatório",
    authEmailRequiredMsg: "Por favor, use um número de telefone para se registrar. O registro por e-mail requer um número de telefone para a verificação OTP.",
    authSocialLoginError: "Erro de login",
    // Delivery Register
    deliveryRegisterFullNameLabel: "Nome completo",
    deliveryRegisterFullNamePlaceholder: "Jeremiah Charles",
    deliveryRegisterNameError: "Por favor, insira pelo menos dois nomes.",
    orderShipped: "Enviado",
    orderReceived: "Recebido",
    orderReturn: "Devolver",
    deliveryReviewOrder: "Revise seu pedido antes da entrega",
    deliveryDropOffLocation: "Local de entrega",
    deliveryNoActive: "Nenhuma entrega ativa",
    deliveryEstimatedTime: "Tempo de entrega estimado",
    deliveryStandard: "Padrão",
    deliveryExpress: "Expresso",
    deliveryPostalAddress: "Endereço postal",
    deliveryDropOffAddress: "Endereço de entrega",
    deliveryCallDriver: "Ligar para o motorista",
    deliveryCost: "Custo de entrega",
    deliveryConfirm: "Confirmar",
    // --- Loans ---
    "vendor.loans.loans_request": "Pedido de empréstimo",
    "vendor.loans.repayments_track": "Rastreio de pagamentos",
};

/** Chinese (Simplified). */
const zh: TranslationKeys = {
    languageScreenTitle: '选择您的语言',
    languageScreenChoosePreferred: '选择首选语言',
    languageScreenSkip: '跳过',
    affiliateRegisterTitle: "Create an account",
    affiliateLoginTitle: "Welcome back",
    affiliatePhonePlaceholder: "Enter +255xxx xxx xxx",
    affiliateTermsAgreement: "I have read agree to Tunzaa Terms and Conditions of use, privacy policy, and return policy",
    affiliateRegisterButton: "Create Account",
    affiliateNoAccount: "Don't have an account?",
    affiliateLoginLink: "Log in",
    affiliateAlreadyAccount: "Already have an account?",

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

    settingsTitle: '设置',
    settingsActivities: '您的活动',
    settingsNotifications: '应用内通知',
    settingsReminders: '提醒',
    settingsDelivery: '交货订单',
    settingsPolicies: '政策',
    settingsAccount: '管理帐户',
    settingsInvite: '邀请朋友',
    settingsLanguage: '语言',
    settingsLogout: '注销',
    settingsLogoutConfirmTitle: '注销',
    settingsLogoutConfirmMessage: '您确定要注销吗？',
    settingsVersion: 'Tunzaa 版本 2.0',

    onboardingStep1Title: '商业文件',
    onboardingStep1Subtitle: '附加商业文件对于提高您的账户安全性非常重要。',
    onboardingStep1UploadInfo: '上传以下信息',
    onboardingStep1License: '营业执照',
    onboardingStep1LicensePlaceholder: '输入执照号码',
    onboardingStep1LicenseUpload: '上传执照 (PDF/图片)',
    onboardingStep1TIN: '商业纳税人识别号',
    onboardingStep1TINPlaceholder: '输入纳税人识别号',
    onboardingStep1TINUpload: '上传纳税人识别号 (PDF/图片)',
    onboardingStep1BRELA: 'BRELA 注册证书',
    onboardingStep1BRELAPlaceholder: '输入注册号码',
    onboardingStep1BRELAUpload: '上传证书 (PDF/图片)',
    onboardingStep1Skip: '稍后设置',
    onboardingStep1Back: '返回',
    onboardingStep1Next: '继续',
    onboardingStep1Saving: '保存中...',

    onboardingStep2Title: '商店详情',
    onboardingStep2Subtitle: 'Logo、商店名称和商店描述对于在 Tunzaa 上创建您的商店非常重要。',
    onboardingStep2AddLogo: '添加 Logo*',
    onboardingStep2CompanyName: '公司名称',
    onboardingStep2CompanyNamePlaceholder: '输入公司名称',
    onboardingStep2Phone: '商店电话号码',
    onboardingStep2PhonePlaceholder: '示例：+255 700 000 000',
    onboardingStep2Description: '添加更多细节',
    onboardingStep2DescriptionPlaceholder: '在此输入描述',
    onboardingStep2CharLimit: '不应超过 240 个单词',
    onboardingStep2Required: '必填部分',
    onboardingStep2PermissionError: '抱歉，我们需要访问您照片的权限。',
    onboardingStep2ValidationShopName: '请输入您的公司 or 商店名称。',

    onboardingStep3Title: '商店位置',
    onboardingStep3Subtitle: '通过设置商店位置，让客户轻松关注产品。',
    onboardingStep3CardTitle: '设置商店位置',
    onboardingStep3ManualButton: '使用文字输入',
    onboardingStep3Or: '或',
    onboardingStep3GPSButton: '在地图上选择',
    onboardingStep3RegionLabel: '地区',
    onboardingStep3MunicipalLabel: '市/县',
    onboardingStep3WardLabel: '街道/教区',
    onboardingStep3RegionPlaceholder: '示例：达累斯萨拉姆',
    onboardingStep3MunicipalPlaceholder: '示例：基农多尼',
    onboardingStep3WardPlaceholder: '示例：基及尼亚马',
    onboardingStep3NotesLabel: '额外详情',
    onboardingStep3NotesPlaceholder: '示例：7号街，药店附近...',
    onboardingStep3ValidationLocation: '请选择地区、市/县和街道/教区。',
    onboardingStep3Save: '保存',
    onboardingStep3ManualSubtitle: '准确填写您的位置信息，以便客户轻松找到您。',
    onboardingStep3MapSubtitle: '在地图上拖动大头针，为您的商店选择正确的位置。',
    onboardingStep3MapMarker: '您的商店',

    onboardingStep4Title: '核对信息',
    onboardingStep4Subtitle: '在继续之前核对您的商店详情。',
    onboardingStep4Edit: '编辑',
    onboardingStep4NotesLabel: '额外详情',
    onboardingStep4MultiLocationQuestion: '您是否有多个商店位置？',
    onboardingStep4AddShop: '添加商店',

    onboardingStep5Title: '商业文件',
    onboardingStep5Subtitle: '附加商业文件对于提高您的账户安全性非常重要。',
    onboardingStep5CardHeader: '上传以下信息',
    onboardingStep5License: '营业执照',
    onboardingStep5TIN: '税务登记证 (TIN)',
    onboardingStep5BRELA: 'BRELA 注册证书',
    onboardingStep5UploadPrimary: '点击此处上传',
    onboardingStep5UploadSecondary: 'PDF、PNG 或 JPG（最大 5MB）',
    onboardingStep5UploadSuccess: '文件上传成功',
    onboardingStep5SkipLater: '稍后添加',
    onboardingStep5Wait: '请稍候...',
    onboardingStep5Uploading: '上传中...',
    onboardingStep5SuccessModalTitle: '恭喜！',
    onboardingStep5SuccessModalDescription: '我们已收到您的文件。请稍候，我们将在接下来的 24 到 48 小时内审核详情。',
    onboardingStep5SuccessModalButton: '好的',

    // Login Screen
    loginTitle: "欢迎回来",
    loginSubtitle: "输入您的详细信息以登录",
    loginInputPlaceholder: "电话号码或电子邮件",
    loginPasswordPlaceholder: "输入密码",
    loginForgotPassword: "忘记密码？",
    loginAgreedTerms: "我同意条款和条件",
    loginButton: "登录",
    loginOrContinue: "或继续使用",
    loginNoAccount: "没有账号？立即注册",
    loginSkip: "跳过",
    otpTitle: "验证并创建密码",
    otpInstruction: "输入发送到您手机号码或电子邮件的6位代码",
    otpNoCode: "没有收到代码？",
    otpResend: "重发",
    otpTimer: "重发代码倒计时",
    otpContinue: "继续",
    otpInvalidCode: "代码无效",
    otpEnterAllDigits: "请输入全部6位数字",
    otpVerifyFailed: "验证失败",
    forgotPasswordTitle: "忘记密码",
    forgotPasswordSubtitle: "密码恢复功能即将推出。",
    mauzoHeader: "Mauzo by Tunzaa",
    mauzoSlide1Title: "产品管理",
    mauzoSlide1Desc: "我们通过简单的工具简化了产品管理流程，您可以轻松添加、编辑和删除产品。",
    mauzoSlide2Title: "订单管理",
    mauzoSlide2Desc: "在一个地方管理您的库存、销售和客户信息，以便您随时随地轻松访问这些数据。",
    mauzoSlide3Title: "钱包管理",
    mauzoSlide3Desc: "使用我们的财务管理工具来确保监督并处理金融机构的现金流。",
    mauzoSlide4Title: "物流管理",
    mauzoSlide4Desc: "由数字工具驱动，确保产品安全高效地移动，直到送到终端客户手中。",
    mauzoCreateAccount: "创建一个账户",
    mauzoAlreadyAccount: "已经有账户了？",
    mauzoSignIn: "登录",
    deliveryLoginTitle: "登录",
    deliveryPhoneLabel: "电话号码",
    deliveryPasswordLabel: "密码",
    deliverySaveInfo: "保存信息",
    deliveryForgotPassword: "忘记密码？",
    deliveryCreateAccount: "创建账户",
    deliverySigningIn: "登录中...",
    deliveryContinue: "继续",
    deliveryBack: "返回",
    deliveryOtpTitle: "验证代码",
    deliveryOtpSubtitle: "输入发送到号码的验证码",
    deliveryWrongNumber: "号码错误？",
    deliveryNoOtp: "没有收到验证码？",
    deliveryRequestAgain: "重新请求",
    deliveryVerifying: "验证中...",
    deliveryVerify: "验证",
    deliverySuccessLogin: "登录成功！",
    deliverySuccessVerify: "验证完成！请登录。",
    deliveryErrorLogin: "电话号码或密码不正确",
    deliveryErrorOtp: "代码不正确",
    // Register Screen
    registerTitleBuyer: "创建帐户",
    registerTitleMerchant: "创建企业帐户",
    registerSubtitlePreFilled: "确认您的详细信息并创建密码",
    registerSubtitleEmpty: "请填写您的详细信息以开始",
    registerFirstNamePlaceholder: "输入您的名字",
    registerLastNamePlaceholder: "输入您的姓氏",
    registerPhoneEmailPlaceholder: "电话号码",
    registerPasswordPlaceholder: "创建密码",
    registerButton: "创建帐户",
    registerAlreadyAccount: "已有账号？登录",
    registerTermsLink: "条款和条件",

    // Role Screen (additional)
    roleScreenOptionSell: "销售产品/服务",
    roleScreenOptionDelivery: "提供送货服务",
    roleScreenOptionFinancial: "提供贷款和金融服务",
    roleScreenOptionAffiliate: "加入作为联盟营销人员",
    roleScreenAlreadyAccount: "已有账号？登录",
    // Common
    commonNext: "继续",
    commonBack: "返回",
    commonSaving: "保存中...",
    commonSuccess: "成功",
    commonError: "错误",
    commonTryAgain: "请重试",
    commonLoading: "加载中...",
    // Auth Alerts
    authTermsRequired: "需要同意条款",
    authTermsRequiredMsg: "请同意条款和条件",
    authMissingFields: "缺少字段",
    authMissingFieldsMsg: "请填写所有字段",
    authLoginFailed: "登录失败",
    authLoginFailedMsg: "登录出错。请检查您的凭据。",
    authRegistrationError: "注册错误",
    authRegistrationErrorMsg: "创建帐户出错。请重试。",
    authEmailRequired: "需要电话号码",
    authEmailRequiredMsg: "请使用电话号码注册。基于电子邮件的注册需要电话号码进行 OTP 验证。",
    authSocialLoginError: "登录错误",
    // Delivery Register
    deliveryRegisterFullNameLabel: "全名",
    deliveryRegisterFullNamePlaceholder: "杰里迈亚·查尔斯",
    deliveryRegisterNameError: "请输入至少两个名字。",
    orderShipped: "已发货",
    orderReceived: "已收货",
    orderReturn: "退货",
    deliveryReviewOrder: "送货前核对您的订单",
    deliveryDropOffLocation: "送货地点",
    deliveryNoActive: "没有进行中的送货",
    deliveryEstimatedTime: "预计送达时间",
    deliveryStandard: "标准",
    deliveryExpress: "快递",
    deliveryPostalAddress: "邮寄地址",
    deliveryDropOffAddress: "送货地址",
    deliveryCallDriver: "致电司机",
    deliveryCost: "送货费用",
    deliveryConfirm: "确认",
    // --- Loans ---
    "vendor.loans.loans_request": "贷款申请",
    "vendor.loans.repayments_track": "还款追踪",
};

/**
 * Hook or function to get translations for a given language.
 * Currently uses flat objects.
 */
export const getTranslations = (lang: LanguageCode): TranslationKeys => {
    switch (lang) {
        case 'sw':
            return sw;
        case 'fr':
            return fr;
        case 'ar':
            return ar;
        case 'es':
            return es;
        case 'pt':
            return pt;
        case 'zh':
            return zh;
        default:
            return en;
    }
};
