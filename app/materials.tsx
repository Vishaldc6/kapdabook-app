import FormInput from '@/src/components/FormInput';
import { materialOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Material } from '@/src/types';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Edit, Package, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MaterialsScreen() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    extra_detail: '',
    hsn_code: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await materialOperations.getAll();
      setMaterials(data as Material[]);
    } catch (error) {
      Alert.alert(t('error'), t('failedToLoadMaterials'));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('materialNameRequired');
    }

    if (!formData.hsn_code.trim()) {
      newErrors.hsn_code = t('materialHSNCodeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {    
    // return;
    if (!validateForm()) return;

    try {
      if (editingMaterial) {
        await materialOperations.update(editingMaterial.id, formData);
      } else {
        await materialOperations.create(formData);
      }

      setModalVisible(false);
      resetForm();
      loadMaterials();
      Alert.alert(t('success'), editingMaterial ? t('materialUpdated') : t('materialCreated'));
    } catch (error) {
      Alert.alert(t('error'), t('failedToSaveMaterial'));
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      extra_detail: material.extra_detail || '',
      hsn_code: material.hsn_code || ''
    });
    setModalVisible(true);
  };

  const handleDelete = (material: Material) => {
    Alert.alert(
      t('deleteMaterial'),
      t('deleteMaterialConfirm', { name: material.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await materialOperations.delete(material.id);
              loadMaterials();
              Alert.alert(t('success'), t('materialDeleted'));
            } catch (error) {
              Alert.alert(t('error'), t('failedToDeleteMaterial'));
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({ name: '', extra_detail: '', hsn_code: '' });
    setErrors({});
    setEditingMaterial(null);
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
          <Package size={24} color="#2563EB" />
          <Text style={styles.title}>{t('materialsManagement')}</Text>
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
        {materials.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{t('noMaterialsFound')}</Text>
            <Text style={styles.emptySubtitle}>{t('addFirstMaterial')}</Text>
          </View>
        ) : (
          materials.map((material) => (
            <View key={material.id} style={styles.materialCard}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{material.name}</Text>
                {material.extra_detail && (
                  <Text style={styles.materialDetail}>{material.extra_detail}</Text>
                )}
                {material.hsn_code && (
                  <Text style={styles.materialDetail}>{material.hsn_code}</Text>
                )}
              </View>
              <View style={styles.materialActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(material)}
                >
                  <Edit size={18} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(material)}
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
              {editingMaterial ? t('editMaterial') : t('addNewMaterial')}
            </Text>

            <ScrollView style={styles.modalForm}>
              <FormInput
                label={t('materialName')}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                error={errors.name}
                required
                placeholder={t('materialNamePlaceholder')}
              />

              <FormInput
                label={t('additionalDetails')}
                value={formData.extra_detail}
                onChangeText={(text) => setFormData({ ...formData, extra_detail: text })}
                multiline
                numberOfLines={3}
                placeholder={t('additionalDetailsPlaceholder')}
              />

              <FormInput
                label={t('materialHSNCode')}
                value={formData.hsn_code}
                onChangeText={(text) => setFormData({ ...formData, hsn_code: text })}
                error={errors.hsn_code}
                required
                placeholder={t('materialHSNCodePlaceholder')}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingMaterial ? t('update') : t('save')}
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
  materialCard: {
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
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  materialDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  materialActions: {
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