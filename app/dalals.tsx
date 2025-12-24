import FormInput from '@/src/components/FormInput';
import { dalalOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Dalal } from '@/src/types';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Edit, Plus, Trash2, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DalalsScreen() {
  const { t } = useLanguage();
  const [dalals, setDalals] = useState<Dalal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDalal, setEditingDalal] = useState<Dalal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDalals();
  }, []);

  const loadDalals = async () => {
    try {
      const data = await dalalOperations.getAll();
      setDalals(data);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadDalals'));
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
      if (editingDalal) {
        await dalalOperations.update(editingDalal.id, formData);
      } else {
        await dalalOperations.create(formData);
      }

      setModalVisible(false);
      resetForm();
      loadDalals();
      Alert.alert(t('success'), editingDalal ? t('dalalUpdated') : t('dalalCreated'));
    } catch (error) {
      Alert.alert(t('error'), t('failedToSaveDalal'));
    }
  };

  const handleEdit = (dalal: Dalal) => {
    setEditingDalal(dalal);
    setFormData({
      name: dalal.name,
      contact_number: dalal.contact_number,
      address: dalal.address || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (dalal: Dalal) => {
    Alert.alert(
      t('deleteDalal'),
      t('deleteDalalConfirm', { name: dalal.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dalalOperations.delete(dalal.id);
              loadDalals();
              Alert.alert(t('success'), t('dalalDeleted'));
            } catch (error) {
              Alert.alert(t('error'), t('failedToDeleteDalal'));
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({ name: '', contact_number: '', address: '' });
    setErrors({});
    setEditingDalal(null);
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
          <User size={24} color="#2563EB" />
          <Text style={styles.title}>{t('dalalsManagement')}</Text>
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
        {dalals.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{t('noDalalsFound')}</Text>
            <Text style={styles.emptySubtitle}>{t('addFirstDalal')}</Text>
          </View>
        ) : (
          dalals.map((dalal) => (
            <View key={dalal.id} style={styles.dalalCard}>
              <View style={styles.dalalInfo}>
                <Text style={styles.dalalName}>{dalal.name}</Text>
                <Text style={styles.dalalContact}>{dalal.contact_number}</Text>
                {dalal.address && (
                  <Text style={styles.dalalAddress}>{dalal.address}</Text>
                )}
              </View>
              <View style={styles.dalalActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(dalal)}
                >
                  <Edit size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(dalal)}
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
              {editingDalal ? t('editDalal') : t('addNewDalal')}
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
                label={t('contactNumber')}
                value={formData.contact_number}
                onChangeText={(text) => setFormData({ ...formData, contact_number: text })}
                keyboardType="phone-pad"
                error={errors.contact_number}
                maxLength={10}
                required
              />

              <FormInput
                label={t('address')}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingDalal ? t('update') : t('save')}
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
  dalalCard: {
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
  dalalInfo: {
    flex: 1,
  },
  dalalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dalalContact: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  dalalAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  dalalActions: {
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