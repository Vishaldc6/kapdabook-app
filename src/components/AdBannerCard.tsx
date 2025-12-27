import React from 'react';
import { View, ViewProps } from 'react-native';
import { BannerAd, BannerAdProps, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const AdBannerCard = ({ unitId, ...props }: Partial<BannerAdProps> & ViewProps) => {
    return (
        <View style={{ alignItems: 'center' }}>
            <BannerAd
                unitId={unitId ?? TestIds.BANNER}
                size={BannerAdSize.BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdFailedToLoad={(error) => {
                    console.log('Ad failed:', error);
                }}
            />
        </View >
    )
}

export default AdBannerCard