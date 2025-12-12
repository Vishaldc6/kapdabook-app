import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguageState = () => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string, params?: Record<string, any>) => {
    const translations = getTranslations(language);
    const typedTranslations = translations as Record<string, string>;
    let translation: string = typedTranslations[key] ?? key;
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    return translation;
  };

  return { language, setLanguage, t };
};

const getTranslations = (language: Language) => {
  const translations = {
    en: {
      // Navigation
      dashboard: 'Dashboard',
      buyers: 'Buyers',
      dalals: 'Dalals',
      materials: 'Materials',
      bills: 'Bills',
      dhara: 'Payment Terms',
      taxes: 'Taxes',
      settings: 'Settings',
      
      // Common
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      update: 'Update',
      cancel: 'Cancel',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      
      // Dashboard
      textileBillingDashboard: 'Textile Billing Dashboard',
      welcomeBack: 'Welcome back! Here\'s your business overview',
      totalRevenue: 'Total Revenue',
      pendingAmount: 'Pending Amount',
      totalBuyers: 'Total Buyers',
      totalBills: 'Total Bills',
      urgentBills: 'Urgent Bills (Due ≤ 5 Days)',
      noUrgentBills: 'No urgent bills found',
      allPaymentsUpToDate: 'All payments are up to date!',
      quickSummary: 'Quick Summary',
      pendingBills: 'Pending Bills:',
      totalDalals: 'Total Dalals:',
      materialTypes: 'Material Types:',
      
      // Buyers
      buyersManagement: 'Buyers Management',
      noBuyersFound: 'No buyers found',
      addFirstBuyer: 'Add your first buyer to get started',
      addNewBuyer: 'Add New Buyer',
      editBuyer: 'Edit Buyer',
      deleteBuyer: 'Delete Buyer',
      deleteBuyerConfirm: 'Are you sure you want to delete {{name}}?',
      name: 'Name',
      address: 'Address',
      contactNumber: 'Contact Number',
      gstNumber: 'GST Number',
      nameRequired: 'Name is required',
      contactRequired: 'Contact number is required',
      contactValidation: 'Contact number must be 10 digits',
      buyerCreated: 'Buyer created successfully!',
      buyerUpdated: 'Buyer updated successfully!',
      buyerDeleted: 'Buyer deleted successfully!',
      failedToLoadBuyers: 'Failed to load buyers',
      failedToSaveBuyer: 'Failed to save buyer',
      failedToDeleteBuyer: 'Failed to delete buyer',
      
      // Dalals
      dalalsManagement: 'Dalals Management',
      noDalalsFound: 'No dalals found',
      addFirstDalal: 'Add your first dalal to get started',
      addNewDalal: 'Add New Dalal',
      editDalal: 'Edit Dalal',
      deleteDalal: 'Delete Dalal',
      deleteDalalConfirm: 'Are you sure you want to delete {{name}}?',
      dalalCreated: 'Dalal created successfully!',
      dalalUpdated: 'Dalal updated successfully!',
      dalalDeleted: 'Dalal deleted successfully!',
      failedToLoadDalals: 'Failed to load dalals',
      failedToSaveDalal: 'Failed to save dalal',
      failedToDeleteDalal: 'Failed to delete dalal',
      
      // Materials
      materialsManagement: 'Materials Management',
      noMaterialsFound: 'No materials found',
      addFirstMaterial: 'Add your first material to get started',
      addNewMaterial: 'Add New Material',
      editMaterial: 'Edit Material',
      deleteMaterial: 'Delete Material',
      deleteMaterialConfirm: 'Are you sure you want to delete {{name}}?',
      materialName: 'Material Name',
      additionalDetails: 'Additional Details',
      materialHSNCode: 'Material HSN Code',
      materialNamePlaceholder: 'e.g., Cotton, Silk, Polyester',
      additionalDetailsPlaceholder: 'Optional description or specifications',
      materialHSNCodePlaceholder: 'e.g., 52010000, 52020000, 52030000',
      materialNameRequired: 'Material name is required',
      materialHSNCodeRequired: 'Material HSN code is required',
      materialCreated: 'Material created successfully!',
      materialUpdated: 'Material updated successfully!',
      materialDeleted: 'Material deleted successfully!',
      failedToLoadMaterials: 'Failed to load materials',
      failedToSaveMaterial: 'Failed to save material',
      failedToDeleteMaterial: 'Failed to delete material',
      
      // Dhara
      dharaManagement: 'Payment Terms Management',
      noDharasFound: 'No payment terms found',
      addFirstDhara: 'Add your first payment term to get started',
      addNewDhara: 'Add New Payment Term',
      editDhara: 'Edit Payment Term',
      deleteDhara: 'Delete Payment Term',
      deleteDharaConfirm: 'Are you sure you want to delete {{name}}?',
      dharaName: 'Payment Term Name',
      paymentDays: 'Payment Days',
      dharaNamePlaceholder: 'e.g., Regular, War to War, Cash',
      daysPlaceholder: 'e.g., 35, 10, 0',
      dharaNameRequired: 'Payment term name is required',
      daysRequired: 'Days is required',
      daysValidNumber: 'Days must be a valid number (0 or greater)',
      days: '{{count}} days',
      dharaCreated: 'Payment term created successfully!',
      dharaUpdated: 'Payment term updated successfully!',
      dharaDeleted: 'Payment term deleted successfully!',
      failedToLoadDharas: 'Failed to load payment terms',
      failedToSaveDhara: 'Failed to save payment term',
      failedToDeleteDhara: 'Failed to delete payment term',
      // Taxes
      taxesManagement: 'Taxes Management',
      noTaxesFound: 'No taxes found',
      addFirstTax: 'Add your first tax to get started',
      addNewTax: 'Add New Tax',
      editTax: 'Edit Tax',
      deleteTax: 'Delete Tax',
      deleteTaxConfirm: 'Are you sure you want to delete {{name}}?',
      taxName: 'Tax Name',
      taxPercentage: 'Tax Percentage',
      taxNamePlaceholder: 'e.g., IGST, SGST, CGST',
      taxPercentagePlaceholder: 'e.g., 5, 10',
      taxNameRequired: 'Tax name is required',
      taxPercentageRequired: 'Tax percentage is required',
      taxCreated: 'Tax created successfully!',
      taxUpdated: 'Tax updated successfully!',
      taxDeleted: 'Tax deleted successfully!',
      failedToLoadTaxes: 'Failed to load taxes',
      failedToSaveTax: 'Failed to save tax',
      failedToDeleteTax: 'Failed to delete tax',

      // Bills
      billsManagement: 'Bills Management',
      noBillsFound: 'No bills found',
      createFirstBill: 'Create your first bill to get started',
      noPendingBills: 'No pending bills',
      noPaidBills: 'No paid bills',
      createNewBill: 'Create New Bill',
      date: 'Date',
      buyer: 'Buyer',
      dalal: 'Dalal',
      material: 'Material',
      meter: 'Meter',
      priceRate: 'Price Rate',
      paymentTerms: 'Payment Terms',
      chalanNumber: 'Chalan Number',
      takaCount: 'Taka Count',
      gst_type: 'GST Type',
      buyerRequired: 'Please select a buyer',
      dalalRequired: 'Please select a dalal',
      materialRequired: 'Please select a material',
      dharaRequired: 'Please select payment terms',
      meterRequired: 'Meter is required',
      priceRateRequired: 'Price rate is required',
      chalanRequired: 'Chalan number is required',
      takaCountRequired: 'Taka count is required',
      gstRequired: 'Please select gst type',
      meterValidation: 'Meter must be a valid number',
      priceRateValidation: 'Price rate must be a valid number',
      takaCountValidation: 'Taka count must be a valid number',
      createBill: 'Create Bill',
      billCreated: 'Bill created successfully!',
      failedToCreateBill: 'Failed to create bill',
      markAsPaid: 'Mark as Paid',
      markBillPaid: 'Mark bill #{{id}} as paid?',
      markPaid: 'Mark Paid',
      generatePDF: 'Generate PDF',
      failedToGeneratePDF: 'Failed to generate PDF',
      filterBills: 'Filter Bills',
      allBills: 'All Bills',
      pendingBillsFilter: 'Pending Bills',
      paidBills: 'Paid Bills',
      close: 'Close',
      
      // Settings
      settingsAnalytics: 'Settings & Analytics',
      databaseOverview: 'Database Overview',
      financialSummary: 'Financial Summary',
      dataManagement: 'Data Management',
      databaseBackup: 'Database Backup',
      databaseBackupDesc: 'Export your complete database including all buyers, dalals, materials, and bills data.',
      export: 'Export',
      exporting: 'Exporting...',
      exportSuccessful: 'Export Successful',
      exportSuccessfulDesc: 'Database backup has been created and shared successfully!',
      exportFailed: 'Export Failed',
      exportFailedDesc: 'Failed to export database. Please try again.',
      appInformation: 'App Information',
      version: 'Version',
      databaseEngine: 'Database Engine',
      platform: 'Platform',
      lastBackup: 'Last Backup',
      never: 'Never',
      
      // Language
      language: 'Language',
      selectLanguage: 'Select Language',
      english: 'English',
      hindi: 'हिंदी',
    },
    hi: {
      // Navigation
      dashboard: 'डैशबोर्ड',
      buyers: 'खरीदार',
      dalals: 'दलाल',
      materials: 'सामग्री',
      bills: 'बिल',
      dhara: 'भुगतान शर्तें',
      taxes: 'कर',
      settings: 'सेटिंग्स',
      
      // Common
      add: 'जोड़ें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      save: 'सेव करें',
      update: 'अपडेट करें',
      cancel: 'रद्द करें',
      success: 'सफलता',
      error: 'त्रुटि',
      loading: 'लोड हो रहा है...',
      
      // Dashboard
      textileBillingDashboard: 'टेक्सटाइल बिलिंग डैशबोर्ड',
      welcomeBack: 'वापस स्वागत है! यहाँ आपके व्यापार का अवलोकन है',
      totalRevenue: 'कुल आय',
      pendingAmount: 'बकाया राशि',
      totalBuyers: 'कुल खरीदार',
      totalBills: 'कुल बिल',
      urgentBills: 'तत्काल बिल (≤ 5 दिन)',
      noUrgentBills: 'कोई तत्काल बिल नहीं मिला',
      allPaymentsUpToDate: 'सभी भुगतान अप टू डेट हैं!',
      quickSummary: 'त्वरित सारांश',
      pendingBills: 'बकाया बिल:',
      totalDalals: 'कुल दलाल:',
      materialTypes: 'सामग्री प्रकार:',
      
      // Buyers
      buyersManagement: 'खरीदार प्रबंधन',
      noBuyersFound: 'कोई खरीदार नहीं मिला',
      addFirstBuyer: 'शुरुआत करने के लिए अपना पहला खरीदार जोड़ें',
      addNewBuyer: 'नया खरीदार जोड़ें',
      editBuyer: 'खरीदार संपादित करें',
      deleteBuyer: 'खरीदार हटाएं',
      deleteBuyerConfirm: 'क्या आप वाकई {{name}} को हटाना चाहते हैं?',
      name: 'नाम',
      address: 'पता',
      contactNumber: 'संपर्क नंबर',
      gstNumber: 'जीएसटी नंबर',
      nameRequired: 'नाम आवश्यक है',
      contactRequired: 'संपर्क नंबर आवश्यक है',
      contactValidation: 'संपर्क नंबर 10 अंकों का होना चाहिए',
      buyerCreated: 'खरीदार सफलतापूर्वक बनाया गया!',
      buyerUpdated: 'खरीदार सफलतापूर्वक अपडेट किया गया!',
      buyerDeleted: 'खरीदार सफलतापूर्वक हटाया गया!',
      failedToLoadBuyers: 'खरीदार लोड करने में विफल',
      failedToSaveBuyer: 'खरीदार सेव करने में विफल',
      failedToDeleteBuyer: 'खरीदार हटाने में विफल',
      
      // Dalals
      dalalsManagement: 'दलाल प्रबंधन',
      noDalalsFound: 'कोई दलाल नहीं मिला',
      addFirstDalal: 'शुरुआत करने के लिए अपना पहला दलाल जोड़ें',
      addNewDalal: 'नया दलाल जोड़ें',
      editDalal: 'दलाल संपादित करें',
      deleteDalal: 'दलाल हटाएं',
      deleteDalalConfirm: 'क्या आप वाकई {{name}} को हटाना चाहते हैं?',
      dalalCreated: 'दलाल सफलतापूर्वक बनाया गया!',
      dalalUpdated: 'दलाल सफलतापूर्वक अपडेट किया गया!',
      dalalDeleted: 'दलाल सफलतापूर्वक हटाया गया!',
      failedToLoadDalals: 'दलाल लोड करने में विफल',
      failedToSaveDalal: 'दलाल सेव करने में विफल',
      failedToDeleteDalal: 'दलाल हटाने में विफल',
      
      // Materials
      materialsManagement: 'सामग्री प्रबंधन',
      noMaterialsFound: 'कोई सामग्री नहीं मिली',
      addFirstMaterial: 'शुरुआत करने के लिए अपनी पहली सामग्री जोड़ें',
      addNewMaterial: 'नई सामग्री जोड़ें',
      editMaterial: 'सामग्री संपादित करें',
      deleteMaterial: 'सामग्री हटाएं',
      deleteMaterialConfirm: 'क्या आप वाकई {{name}} को हटाना चाहते हैं?',
      materialName: 'सामग्री का नाम',
      additionalDetails: 'अतिरिक्त विवरण',
      materialHSNCode: 'सामग्री HSN कोड',
      materialNamePlaceholder: 'जैसे, कॉटन, सिल्क, पॉलिएस्टर',
      additionalDetailsPlaceholder: 'वैकल्पिक विवरण या विशिष्टताएं',
      materialHSNCodePlaceholder: 'जैसे, 52010000, 52020000, 52030000',
      materialNameRequired: 'सामग्री का नाम आवश्यक है',
      materialHSNCodeRequired: 'सामग्री HSN कोड आवश्यक है',
      materialCreated: 'सामग्री सफलतापूर्वक बनाई गई!',
      materialUpdated: 'सामग्री सफलतापूर्वक अपडेट की गई!',
      materialDeleted: 'सामग्री सफलतापूर्वक हटाई गई!',
      failedToLoadMaterials: 'सामग्री लोड करने में विफल',
      failedToSaveMaterial: 'सामग्री सेव करने में विफल',
      failedToDeleteMaterial: 'सामग्री हटाने में विफल',
      
      // Dhara
      dharaManagement: 'भुगतान शर्तें प्रबंधन',
      noDharasFound: 'कोई भुगतान शर्तें नहीं मिलीं',
      addFirstDhara: 'शुरुआत करने के लिए अपनी पहली भुगतान शर्त जोड़ें',
      addNewDhara: 'नई भुगतान शर्त जोड़ें',
      editDhara: 'भुगतान शर्त संपादित करें',
      deleteDhara: 'भुगतान शर्त हटाएं',
      deleteDharaConfirm: 'क्या आप वाकई {{name}} को हटाना चाहते हैं?',
      dharaName: 'भुगतान शर्त का नाम',
      paymentDays: 'भुगतान दिन',
      dharaNamePlaceholder: 'जैसे, नियमित, वार टू वार, कैश',
      daysPlaceholder: 'जैसे, 35, 10, 0',
      dharaNameRequired: 'भुगतान शर्त का नाम आवश्यक है',
      daysRequired: 'दिन आवश्यक है',
      daysValidNumber: 'दिन एक वैध संख्या होनी चाहिए (0 या अधिक)',
      days: '{{count}} दिन',
      dharaCreated: 'भुगतान शर्त सफलतापूर्वक बनाई गई!',
      dharaUpdated: 'भुगतान शर्त सफलतापूर्वक अपडेट की गई!',
      dharaDeleted: 'भुगतान शर्त सफलतापूर्वक हटाई गई!',
      failedToLoadDharas: 'भुगतान शर्तें लोड करने में विफल',
      failedToSaveDhara: 'भुगतान शर्त सेव करने में विफल',
      failedToDeleteDhara: 'भुगतान शर्त हटाने में विफल',
      // Taxes
      taxesManagement: 'कर प्रबंधन',
      noTaxesFound: 'कोई कर नहीं मिला',
      addFirstTax: 'शुरू करने के लिए अपना पहला कर जोड़ें',
      addNewTax: 'नया कर जोड़ें',
      editTax: 'कर संपादित करें',
      deleteTax: 'कर हटाएं',
      deleteTaxConfirm: 'क्या आप वाकई {{name}} को हटाना चाहते हैं?',
      taxName: 'कर का नाम',
      taxPercentage: 'कर प्रतिशत',
      taxNamePlaceholder: 'जैसे, IGST, SGST, CGST',
      taxPercentagePlaceholder: 'जैसे, 5, 10',
      taxNameRequired: 'कर का नाम आवश्यक है',
      taxPercentageRequired: 'कर प्रतिशत आवश्यक है',
      taxCreated: 'कर सफलतापूर्वक बनाया गया!',
      taxUpdated: 'कर सफलतापूर्वक अपडेट किया गया!',
      taxDeleted: 'कर सफलतापूर्वक हटाया गया!',
      failedToLoadTaxes: 'कर लोड करने में विफल',
      failedToSaveTax: 'कर सेव करने में विफल',
      failedToDeleteTax: 'कर हटाने में विफल',

      // Bills
      billsManagement: 'बिल प्रबंधन',
      noBillsFound: 'कोई बिल नहीं मिला',
      createFirstBill: 'शुरुआत करने के लिए अपना पहला बिल बनाएं',
      noPendingBills: 'कोई बकाया बिल नहीं',
      noPaidBills: 'कोई भुगतान किया गया बिल नहीं',
      createNewBill: 'नया बिल बनाएं',
      date: 'दिनांक',
      buyer: 'खरीदार',
      dalal: 'दलाल',
      material: 'सामग्री',
      meter: 'मीटर',
      priceRate: 'मूल्य दर',
      paymentTerms: 'भुगतान शर्तें',
      chalanNumber: 'चालान नंबर',
      takaCount: 'टका गिनती',
      gst_type: 'GST Type',
      buyerRequired: 'कृपया एक खरीदार चुनें',
      dalalRequired: 'कृपया एक दलाल चुनें',
      materialRequired: 'कृपया एक सामग्री चुनें',
      dharaRequired: 'कृपया भुगतान शर्तें चुनें',
      meterRequired: 'मीटर आवश्यक है',
      priceRateRequired: 'मूल्य दर आवश्यक है',
      chalanRequired: 'चालान नंबर आवश्यक है',
      takaCountRequired: 'टका गिनती आवश्यक है',
      gstRequired: 'कृपया GST प्रकार चुनें',
      meterValidation: 'मीटर एक वैध संख्या होनी चाहिए',
      priceRateValidation: 'मूल्य दर एक वैध संख्या होनी चाहिए',
      takaCountValidation: 'टका गिनती एक वैध संख्या होनी चाहिए',
      createBill: 'बिल बनाएं',
      billCreated: 'बिल सफलतापूर्वक बनाया गया!',
      failedToCreateBill: 'बिल बनाने में विफल',
      markAsPaid: 'भुगतान के रूप में चिह्नित करें',
      markBillPaid: 'बिल #{{id}} को भुगतान के रूप में चिह्नित करें?',
      markPaid: 'भुगतान चिह्नित करें',
      generatePDF: 'पीडीएफ जेनरेट करें',
      failedToGeneratePDF: 'पीडीएफ जेनरेट करने में विफल',
      filterBills: 'बिल फिल्टर करें',
      allBills: 'सभी बिल',
      pendingBillsFilter: 'बकाया बिल',
      paidBills: 'भुगतान किए गए बिल',
      close: 'बंद करें',
      
      // Settings
      settingsAnalytics: 'सेटिंग्स और एनालिटिक्स',
      databaseOverview: 'डेटाबेस अवलोकन',
      financialSummary: 'वित्तीय सारांश',
      dataManagement: 'डेटा प्रबंधन',
      databaseBackup: 'डेटाबेस बैकअप',
      databaseBackupDesc: 'सभी खरीदार, दलाल, सामग्री और बिल डेटा सहित अपना पूरा डेटाबेस निर्यात करें।',
      export: 'निर्यात',
      exporting: 'निर्यात हो रहा है...',
      exportSuccessful: 'निर्यात सफल',
      exportSuccessfulDesc: 'डेटाबेस बैकअप बनाया गया और सफलतापूर्वक साझा किया गया!',
      exportFailed: 'निर्यात विफल',
      exportFailedDesc: 'डेटाबेस निर्यात करने में विफल। कृपया पुनः प्रयास करें।',
      appInformation: 'ऐप जानकारी',
      version: 'संस्करण',
      databaseEngine: 'डेटाबेस इंजन',
      platform: 'प्लेटफॉर्म',
      lastBackup: 'अंतिम बैकअप',
      never: 'कभी नहीं',
      
      // Language
      language: 'भाषा',
      selectLanguage: 'भाषा चुनें',
      english: 'English',
      hindi: 'हिंदी',
    }
  };
  
  return translations[language] || translations.en;
};

export { LanguageContext };
