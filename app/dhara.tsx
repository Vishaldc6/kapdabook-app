import FormInput from '@/src/components/FormInput';
import { dharaOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Dhara } from '@/src/types';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Clock, Edit, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DharaScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [dharas, setDharas] = useState<Dhara[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDhara, setEditingDhara] = useState<Dhara | null>(null);
    const [formData, setFormData] = useState({
        dhara_name: '',
        days: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadDharas();
    }, []);

    const loadDharas = async () => {
        try {
            const data = await dharaOperations.getAll();
            setDharas(data);
        } catch (error) {
            Alert.alert(t('error'), t('failedToLoadDharas'));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.dhara_name.trim()) {
            newErrors.dhara_name = t('dharaNameRequired');
        }

        if (!formData.days.trim()) {
            newErrors.days = t('daysRequired');
        } else if (isNaN(parseInt(formData.days)) || parseInt(formData.days) < 0) {
            newErrors.days = t('daysValidNumber');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            if (editingDhara) {
                await dharaOperations.update(editingDhara.id, {
                    dhara_name: formData.dhara_name,
                    days: parseInt(formData.days)
                });
            } else {
                await dharaOperations.create({
                    dhara_name: formData.dhara_name,
                    days: parseInt(formData.days)
                });
            }

            setModalVisible(false);
            resetForm();
            loadDharas();
            Alert.alert(t('success'), editingDhara ? t('dharaUpdated') : t('dharaCreated'));
        } catch (error) {
            Alert.alert(t('error'), t('failedToSaveDhara'));
        }
    };

    const handleEdit = (dhara: Dhara) => {
        setEditingDhara(dhara);
        setFormData({
            dhara_name: dhara.dhara_name,
            days: dhara.days.toString()
        });
        setModalVisible(true);
    };

    const handleDelete = (dhara: Dhara) => {
        Alert.alert(
            t('deleteDhara'),
            t('deleteDharaConfirm', { name: dhara.dhara_name }),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dharaOperations.delete(dhara.id);
                            loadDharas();
                            Alert.alert(t('success'), t('dharaDeleted'));
                        } catch (error) {
                            Alert.alert(t('error'), t('failedToDeleteDhara'));
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setFormData({ dhara_name: '', days: '' });
        setErrors({});
        setEditingDhara(null);
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
                    <Clock size={24} color="#2563EB" />
                    <Text style={styles.title}>{t('dharaManagement')}</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>{t('add')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {dharas.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Clock size={48} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>{t('noDharasFound')}</Text>
                        <Text style={styles.emptySubtitle}>{t('addFirstDhara')}</Text>
                    </View>
                ) : (
                    dharas.map((dhara) => (
                        <View key={dhara.id} style={styles.dharaCard}>
                            <View style={styles.dharaInfo}>
                                <Text style={styles.dharaName}>{dhara.dhara_name}</Text>
                                <Text style={styles.dharaDays}>{t('days', { count: dhara.days })}</Text>
                            </View>
                            <View style={styles.dharaActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(dhara)}
                                >
                                    <Edit size={18} color="#3B82F6" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(dhara)}
                                >
                                    <Trash2 size={18} color="#EF4444" />
                                </TouchableOpacity>
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
                            {editingDhara ? t('editDhara') : t('addNewDhara')}
                        </Text>

                        <ScrollView style={styles.modalForm}>
                            <FormInput
                                label={t('dharaName')}
                                value={formData.dhara_name}
                                onChangeText={(text) => setFormData({ ...formData, dhara_name: text })}
                                error={errors.dhara_name}
                                required
                                placeholder={t('dharaNamePlaceholder')}
                            />

                            <FormInput
                                label={t('paymentDays')}
                                value={formData.days}
                                onChangeText={(text) => setFormData({ ...formData, days: text })}
                                keyboardType="numeric"
                                error={errors.days}
                                required
                                placeholder={t('daysPlaceholder')}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>
                                    {editingDhara ? t('update') : t('save')}
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
        flex: 1,
        padding: 16,
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
    dharaCard: {
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
    dharaInfo: {
        flex: 1,
    },
    dharaName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    dharaDays: {
        fontSize: 14,
        color: '#6B7280',
    },
    dharaActions: {
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