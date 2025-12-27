import { AdEventType, AppOpenAd, TestIds } from "react-native-google-mobile-ads";

export const AdIds = {
    // APP OPEN
    APP_OPEN: __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-1094381619101505~2740262959',
    // BANNERS
    ACCOUNT_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/7223269842',
    BILL_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/8400620146',
    BUYER_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/7334950489',
    DALAL_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/2026783487',
    DASHBOARD_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/1401658028',
    MATERIAL_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/9852484376',
    PAYMENT_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/8539402705',
    SETTING_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/7705010796',
    TAX_BANNER: __DEV__ ? TestIds.BANNER : 'ca-app-pub-1094381619101505/7226321036',
}

let appOpenAd: AppOpenAd | null = null;
let isAdLoaded = false;
let isShowingAd = false;
let adAlreadyShown = false;

export const loadAppOpenAd = () => {
    if (adAlreadyShown) return;

    appOpenAd = AppOpenAd.createForAdRequest(AdIds.APP_OPEN, {
        requestNonPersonalizedAdsOnly: true,
    });

    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('App Open Ad loaded');
        isAdLoaded = true;
        showAppOpenAd()
    });

    appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        isShowingAd = false;
        adAlreadyShown = true;
    });

    appOpenAd.load();
};

export const showAppOpenAd = () => {
    if (appOpenAd && !isShowingAd && !adAlreadyShown && isAdLoaded) {
        isShowingAd = true;
        appOpenAd.show();
    }
};