import FormInput from '@/src/components/FormInput';
import { companyOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { CompanyProfile } from '@/src/types';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useFocusEffect } from 'expo-router';
import { Building2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        // company
        name: '',
        tagline: '',
        address: '',
        contact: '',
        gst: '',
        pan: '',
        business_type: '',
        // bank
        bankName: '',
        accountNo: '',
        ifsc: '',
        branch: '',
        // tc
        termsConditions: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useFocusEffect(
        useCallback(() => {
            loadAccountDetails();
        }, [])
    )

    const loadAccountDetails = async () => {
        const companyInfo = await companyOperations.getProfile() as CompanyProfile;
        companyInfo && setFormData({
            // company
            name: companyInfo.name,
            tagline: companyInfo?.tagline ?? '',
            address: companyInfo.address,
            contact: companyInfo.contact,
            gst: companyInfo.gst,
            pan: companyInfo.pan,
            business_type: companyInfo.business_type,
            // bank
            bankName: companyInfo.bank_name,
            accountNo: companyInfo.account_no,
            ifsc: companyInfo.ifsc,
            branch: companyInfo.branch,
            // tc
            termsConditions: companyInfo.terms_conditions,
        })
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('nameRequired');
        }
        if (!formData.business_type.trim()) {
            newErrors.business_type = t('business_typeRequired');
        }
        if (!formData.address.trim()) {
            newErrors.address = t('addressRequired');
        }
        if (!formData.contact.trim()) {
            newErrors.contact = t('contactRequired');
        } else if (!/^\d{10}$/.test(formData.contact)) {
            newErrors.contact = t('contactValidation');
        }
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst)) {
            newErrors.gst = t('gstValidation');
        }
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
            newErrors.pan = t('panValidation');
        }

        if (!formData.bankName.trim()) {
            newErrors.bankName = t('bankNameRequired');
        }
        if (!formData.branch.trim()) {
            newErrors.branch = t('branchRequired');
        }
        if (!/^[0-9]{9,18}$/.test(formData.accountNo)) {
            newErrors.accountNo = t('accountNoValidation');
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
            newErrors.ifsc = t('ifscValidation');
        }

        if (!formData.termsConditions.trim()) {
            newErrors.termsConditions = t('termsRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            await companyOperations.saveProfile(formData);

            Alert.alert(
                t('success'),
                t('accountSavedSuccessfully')
            );
        } catch (error) {
            Alert.alert(
                t('error'),
                t('failedToSaveAccount')
            );
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />

                <View style={styles.headerContent}>
                    <Building2 size={24} color="#2563EB" />
                    <Text style={styles.title}>{t('accountManagement')}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Company */}
                <View style={styles.detailCard}>
                    <Text style={styles.sectionTitle}>{t('companyDetails')}</Text>
                    <View style={styles.form}>
                        <FormInput
                            label={t('name')}
                            value={formData.name}
                            placeholder={t('companyNamePlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            error={errors.name}
                            required
                        />
                        <FormInput
                            label={t('tagline')}
                            value={formData.tagline}
                            placeholder={t('taglinePlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, tagline: text })}
                            error={errors.tagline}
                        />
                        <FormInput
                            label={t('businessType')}
                            value={formData.business_type}
                            placeholder={t('businessTypePlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, business_type: text })}
                            error={errors.business_type}
                            required
                        />
                        <FormInput
                            label={t('address')}
                            value={formData.address}
                            placeholder={t('addressPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                            numberOfLines={3}
                            error={errors.address}
                            required
                        />
                        <FormInput
                            label={t('contact')}
                            value={formData.contact}
                            placeholder={t('contactPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, contact: text })}
                            keyboardType="phone-pad"
                            error={errors.contact}
                            maxLength={10}
                            required
                        />
                        <FormInput
                            label={t('gst')}
                            value={formData.gst}
                            placeholder={t('gstPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, gst: text })}
                            autoCapitalize="characters"
                            error={errors.gst}
                            required
                        />
                        <FormInput
                            label={t('pan')}
                            value={formData.pan}
                            placeholder={t('panPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, pan: text })}
                            autoCapitalize="characters"
                            error={errors.pan}
                            required
                        />
                    </View>
                </View>
                {/* Bank */}
                <View style={styles.detailCard}>
                    <Text style={styles.sectionTitle}>{t('bankDetails')}</Text>
                    <View style={styles.form}>
                        <FormInput
                            label={t('bankName')}
                            value={formData.bankName}
                            placeholder={t('bankNamePlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                            error={errors.bankName}
                            required
                        />
                        <FormInput
                            label={t('branch')}
                            value={formData.branch}
                            placeholder={t('branchPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, branch: text })}
                            error={errors.branch}
                            required
                        />
                        <FormInput
                            label={t('accountNo')}
                            value={formData.accountNo}
                            placeholder={t('accountNoPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, accountNo: text })}
                            error={errors.accountNo}
                            keyboardType="phone-pad"
                            required
                        />
                        <FormInput
                            label={t('ifsc')}
                            value={formData.ifsc}
                            placeholder={t('ifscPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, ifsc: text })}
                            error={errors.ifsc}
                            required
                        />
                    </View>
                </View>
                {/* TCs */}
                <View style={styles.detailCard}>
                    <Text style={styles.sectionTitle}>{t('termsDetails')}</Text>
                    <View style={styles.form}>
                        <FormInput
                            label={t('termsConditions')}
                            value={formData.termsConditions}
                            placeholder={t('termsPlaceholder')}
                            onChangeText={(text) => setFormData({ ...formData, termsConditions: text })}
                            multiline
                            numberOfLines={5}
                            error={errors.termsConditions}
                            required
                        />
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                    {t('save')}
                </Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    detailCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        padding: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
        borderBottomColor: '#F3F4F6',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    form: {
        flex: 1,
    },
    saveButton: {
        marginVertical: 25,
        marginHorizontal: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    saveButtonText: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
})