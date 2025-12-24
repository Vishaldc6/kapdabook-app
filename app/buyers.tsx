import FormInput from '@/src/components/FormInput';
import { buyerOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Buyer } from '@/src/types';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Edit, Plus, Trash2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BuyersScreen() {
  const { t } = useLanguage();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    gst_number: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      const data = await buyerOperations.getAll();
      setBuyers(data);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadBuyers'));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = t('contactRequired');
    } else if (!/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = t('contactValidation');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingBuyer) {
        await buyerOperations.update(editingBuyer.id, formData);
      } else {
        await buyerOperations.create(formData);
      }

      setModalVisible(false);
      resetForm();
      loadBuyers();
      Alert.alert(t('success'), editingBuyer ? t('buyerUpdated') : t('buyerCreated'));
    } catch (error) {
      Alert.alert(t('error'), t('failedToSaveBuyer'));
    }
  };

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      name: buyer.name,
      address: buyer.address || '',
      contact_number: buyer.contact_number,
      gst_number: buyer.gst_number || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (buyer: Buyer) => {
    Alert.alert(
      t('deleteBuyer'),
      t('deleteBuyerConfirm', { name: buyer.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await buyerOperations.delete(buyer.id);
              loadBuyers();
              Alert.alert(t('success'), t('buyerDeleted'));
            } catch (error) {
              Alert.alert(t('error'), t('failedToDeleteBuyer'));
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', contact_number: '', gst_number: '' });
    setErrors({});
    setEditingBuyer(null);
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
          <Users size={24} color="#2563EB" />
          <Text style={styles.title}>{t('buyersManagement')}</Text>
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
        {buyers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{t('noBuyersFound')}</Text>
            <Text style={styles.emptySubtitle}>{t('addFirstBuyer')}</Text>
          </View>
        ) : (
          buyers.map((buyer) => (
            <View key={buyer.id} style={styles.buyerCard}>
              <View style={styles.buyerInfo}>
                <Text style={styles.buyerName}>{buyer.name}</Text>
                {buyer.address && (
                  <Text style={styles.buyerAddress}>{buyer.address}</Text>
                )}
                <Text style={styles.buyerContact}>{buyer.contact_number}</Text>
                {buyer.gst_number && (
                  <Text style={styles.buyerGst}>GST: {buyer.gst_number}</Text>
                )}
              </View>
              <View style={styles.buyerActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(buyer)}
                >
                  <Edit size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(buyer)}
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
              {editingBuyer ? t('editBuyer') : t('addNewBuyer')}
            </Text>

            <ScrollView style={styles.modalForm}>
              <FormInput
                label={t('name')}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                error={errors.name}
                required
              />

              <FormInput
                label={t('address')}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
              />

              <FormInput
                label={t('contactNumber')}
                value={formData.contact_number}
                onChangeText={(text) => setFormData({ ...formData, contact_number: text })}
                keyboardType="phone-pad"
                error={errors.contact_number}
                maxLength={10}
                required
              />

              <FormInput
                label={t('gstNumber')}
                value={formData.gst_number}
                onChangeText={(text) => setFormData({ ...formData, gst_number: text })}
                autoCapitalize="characters"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingBuyer ? t('update') : t('save')}
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
  buyerCard: {
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
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  buyerAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  buyerContact: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  buyerGst: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  buyerActions: {
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