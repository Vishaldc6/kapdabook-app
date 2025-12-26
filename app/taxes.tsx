import { DrawerToggleButton } from '@react-navigation/drawer';
import { BadgePercent, Edit, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FormInput from '@/src/components/FormInput';
import { taxOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Tax } from '@/src/types';

export default function TaxesScreen() {
    const { t } = useLanguage();
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTax, setEditingTax] = useState<Tax | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        percentage: 0
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadTaxes();
    }, []);

    const loadTaxes = async () => {
        try {
            const data = await taxOperations.getAll();
            setTaxes(data as Tax[]);
        } catch (error) {
            Alert.alert(t('error'), t('failedToLoadTaxes'));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = t('taxNameRequired');

        if (!formData.percentage.toString().trim()) newErrors.percentage = t('taxPercentageRequired');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        console.log({ formData });

        // return;
        if (!validateForm()) return;

        try {
            if (editingTax) {
                await taxOperations.update(editingTax.id, formData);
            } else {
                await taxOperations.create(formData);
            }

            setModalVisible(false);
            resetForm();
            loadTaxes();
            Alert.alert(t('success'), editingTax ? t('taxUpdated') : t('taxCreated'));
        } catch (error) {
            console.log({ error });
            Alert.alert(t('error'), t('failedToSaveTax'));
        }
    };

    const handleEdit = (tax: Tax) => {
        setEditingTax(tax);
        setFormData({
            name: tax.name,
            percentage: tax.percentage || 0
        });
        setModalVisible(true);
    };

    const handleDelete = (tax: Tax) => {
        Alert.alert(
            t('deleteTax'),
            t('deleteTaxConfirm', { name: tax.name }),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await taxOperations.delete(tax.id);
                            loadTaxes();
                            Alert.alert(t('success'), t('taxDeleted'));
                        } catch (error) {
                            Alert.alert(t('error'), t('failedToDeleteTax'));
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setFormData({ name: '', percentage: 0 });
        setErrors({});
        setEditingTax(null);
    };

    const closeModal = () => {
        setModalVisible(false);
        resetForm();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />
                <View style={styles.headerContent}>
                    <BadgePercent size={24} color="#2563EB" />
                    <Text style={styles.title}>{t('taxesManagement')}</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>{t('add')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {taxes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <BadgePercent size={48} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>{t('noTaxesFound')}</Text>
                        <Text style={styles.emptySubtitle}>{t('addFirstTax')}</Text>
                    </View>
                ) : (
                    taxes.map((tax) => (
                        <View key={tax.id} style={styles.taxCard}>
                            <View style={styles.taxInfo}>
                                <Text style={styles.taxName}>{tax.name}</Text>
                                {tax.percentage.toString() && (
                                    <Text style={styles.taxDetail}>{tax.percentage}%</Text>
                                )}
                            </View>
                            <View style={styles.taxActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(tax)}
                                >
                                    <Edit size={18} color="#3B82F6" />
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(tax)}
                                >
                                    <Trash2 size={18} color="#EF4444" />
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingTax ? t('editTax') : t('addNewTax')}
                        </Text>

                        <ScrollView style={styles.modalForm}>
                            <FormInput
                                label={t('taxName')}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                error={errors.name}
                                required
                                placeholder={t('taxNamePlaceholder')}
                                editable={!editingTax}
                            />

                            <FormInput
                                label={t('taxPercentage')}
                                value={formData.percentage.toString()}
                                onChangeText={(text) => setFormData({ ...formData, percentage: Number(text) })}
                                keyboardType='number-pad'
                                numberOfLines={1}
                                placeholder={t('taxPercentagePlaceholder')}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>
                                    {editingTax ? t('update') : t('save')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
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
    menuButton: {
        padding: 8,
        marginRight: 12,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 4,
    },
    content: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 50
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    taxCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    taxInfo: {
        flex: 1,
    },
    taxName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    taxDetail: {
        fontSize: 14,
        color: '#6B7280',
    },
    taxActions: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#EFF6FF',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#FEF2F2',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalForm: {
        maxHeight: 400,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontWeight: '600',
        color: '#6B7280',
    },
    saveButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    saveButtonText: {
        fontWeight: '600',
        color: '#FFFFFF',
    },
});