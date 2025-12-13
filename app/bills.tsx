import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Filter, Plus, ReceiptIndianRupee } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import BillCard from '@/src/components/BillCard';
import FormInput from '@/src/components/FormInput';
import Picker from '@/src/components/Picker';
import { billOperations, buyerOperations, dalalOperations, dharaOperations, materialOperations, taxOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Bill, Buyer, Dalal, Dhara, Material, Tax } from '@/src/types';
import { generateBillPDF } from '@/src/utils/pdfGenerator';

export default function BillsScreen() {
  const { t } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [dalals, setDalals] = useState<Dalal[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [dharas, setDharas] = useState<Dhara[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    buyer_id: 0,
    dalal_id: 0,
    material_id: 0,
    meter: '',
    price_rate: '',
    dhara_id: 0,
    chalan_no: '',
    taka_count: '',
    tax_id: 0
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    },[])
  );

  const loadData = async () => {
    try {
      const [billsData, buyersData, dalalsData, materialsData, dharasData, taxData] = await Promise.all([
        billOperations.getAll(),
        buyerOperations.getAll(),
        dalalOperations.getAll(),
        materialOperations.getAll(),
        dharaOperations.getAll(),
        taxOperations.getAll(),
      ]);

      setBills(billsData as Bill[]);
      setBuyers(buyersData as Buyer[]);
      setDalals(dalalsData as Dalal[]);
      setMaterials(materialsData as Material[]);
      setDharas(dharasData as Dhara[]);
      setTaxes(taxData as Tax[]);
    } catch (error) {
      Alert.alert(t('error'), 'Failed to load data');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.buyer_id) newErrors.buyer_id = t('buyerRequired');
    if (!formData.dalal_id) newErrors.dalal_id = t('dalalRequired');
    if (!formData.material_id) newErrors.material_id = t('materialRequired');
    if (!formData.dhara_id) newErrors.dhara_id = t('dharaRequired');
    if (!formData.meter.trim()) newErrors.meter = t('meterRequired');
    if (!formData.price_rate.trim()) newErrors.price_rate = t('priceRateRequired');
    if (!formData.chalan_no.trim()) newErrors.chalan_no = t('chalanRequired');
    if (!formData.taka_count.trim()) newErrors.taka_count = t('takaCountRequired');
    if (!formData.tax_id) newErrors.tax_id = t('gstRequired');

    // Validate numeric fields
    if (formData.meter && isNaN(parseFloat(formData.meter))) {
      newErrors.meter = t('meterValidation');
    }
    if (formData.price_rate && isNaN(parseFloat(formData.price_rate))) {
      newErrors.price_rate = t('priceRateValidation');
    }
    if (formData.taka_count && isNaN(parseInt(formData.taka_count))) {
      newErrors.taka_count = t('takaCountValidation');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await billOperations.create({
        date: formData.date,
        buyer_id: formData.buyer_id,
        dalal_id: formData.dalal_id,
        material_id: formData.material_id,
        meter: parseFloat(formData.meter),
        price_rate: parseFloat(formData.price_rate),
        dhara_id: formData.dhara_id,
        chalan_no: formData.chalan_no,
        taka_count: parseInt(formData.taka_count),
        tax_id: formData.tax_id
      });

      setModalVisible(false);
      resetForm();
      loadData();
      Alert.alert(t('success'), t('billCreated'));
    } catch (error) {
      Alert.alert(t('error'), t('failedToCreateBill'));
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      buyer_id: 0,
      dalal_id: 0,
      material_id: 0,
      meter: '',
      price_rate: '',
      dhara_id: 0,
      chalan_no: '',
      taka_count: '',
      tax_id: 0
    });
    setErrors({});
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleGeneratePDF = async (bill: Bill) => {
    try {
      await generateBillPDF(bill);
    } catch (error) {
      Alert.alert(t('error'), t('failedToGeneratePDF'));
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filter === 'pending') return !bill.payment_received;
    if (filter === 'paid') return bill.payment_received;
    return true;
  });

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    // On Android, picker closes automatically; on iOS keep it open until user confirms if using inline
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, date: isoDate });
    }
  };

  const buyerItems = buyers.map(buyer => ({ label: buyer.name, value: buyer.id }));
  const dalalItems = dalals.map(dalal => ({ label: dalal.name, value: dalal.id }));
  const materialItems = materials.map(material => ({ label: material.name, value: material.id }));
  const dharaItems = dharas.map(dhara => ({ label: dhara.dhara_name, value: dhara.id }));
  const taxItems = taxes.map(tax => ({ label: tax.name, value: tax.id }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton />
        <View style={styles.headerContent}>
          <ReceiptIndianRupee size={24} color="#2563EB" />
          <Text style={styles.title}>{t('billsManagement')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{t('add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredBills.length === 0 ? (
          <View style={styles.emptyState}>
            <ReceiptIndianRupee size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>{t('noBillsFound')}</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' ? t('createFirstBill') :
                filter === 'pending' ? t('noPendingBills') : t('noPaidBills')}
            </Text>
          </View>
        ) : (
          <View style={styles.billsList}>
            {filteredBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onUpdate={loadData}
                onGeneratePDF={handleGeneratePDF}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Bill Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('createNewBill')}</Text>

            <ScrollView style={styles.modalForm}>
              <TouchableOpacity activeOpacity={1} onPress={() => setShowDatePicker(true)}>
                <FormInput
                  label={t('date')}
                  value={formData.date}
                  editable={false}
                  placeholder="YYYY-MM-DD"
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.date)}
                  mode="date"
                  onChange={handleDateChange}
                />
              )}

              <Picker
                label={t('buyer')}
                selectedValue={formData.buyer_id}
                items={buyerItems}
                onValueChange={(value) => setFormData({ ...formData, buyer_id: value })}
                error={errors.buyer_id}
                required
              />

              <Picker
                label={t('dalal')}
                selectedValue={formData.dalal_id}
                items={dalalItems}
                onValueChange={(value) => setFormData({ ...formData, dalal_id: value })}
                error={errors.dalal_id}
                required
              />

              <Picker
                label={t('material')}
                selectedValue={formData.material_id}
                items={materialItems}
                onValueChange={(value) => setFormData({ ...formData, material_id: value })}
                error={errors.material_id}
                required
              />

              <FormInput
                label={t('meter')}
                value={formData.meter}
                onChangeText={(text) => setFormData({ ...formData, meter: text })}
                keyboardType="numeric"
                error={errors.meter}
                required
              />

              <FormInput
                label={t('priceRate')}
                value={formData.price_rate}
                onChangeText={(text) => setFormData({ ...formData, price_rate: text })}
                keyboardType="numeric"
                error={errors.price_rate}
                required
              />

              <Picker
                label={t('paymentTerms')}
                selectedValue={formData.dhara_id}
                items={dharaItems}
                onValueChange={(value) => setFormData({ ...formData, dhara_id: value })}
                error={errors.dhara_id}
                required
              />

              <FormInput
                label={t('chalanNumber')}
                value={formData.chalan_no}
                onChangeText={(text) => setFormData({ ...formData, chalan_no: text })}
                error={errors.chalan_no}
                required
              />

              <FormInput
                label={t('takaCount')}
                value={formData.taka_count}
                onChangeText={(text) => setFormData({ ...formData, taka_count: text })}
                keyboardType="numeric"
                error={errors.taka_count}
                required
              />

              <Picker
                label={t('gst_type')}
                selectedValue={formData.tax_id}
                items={taxItems}
                onValueChange={(value) => setFormData({ ...formData, tax_id: value })}
                error={errors.tax_id}
                required
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('createBill')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>{t('filterBills')}</Text>

            {(['all', 'pending', 'paid'] as const).map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[styles.filterOption, filter === filterType && styles.filterOptionSelected]}
                onPress={() => {
                  setFilter(filterType);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[styles.filterOptionText, filter === filterType && styles.filterOptionTextSelected]}>
                  {filterType === 'all' ? t('allBills') :
                    filterType === 'pending' ? t('pendingBillsFilter') : t('paidBills')}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.filterModalCloseButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.filterModalCloseText}>{t('close')}</Text>
            </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
    textAlign: 'center',
  },
  billsList: {
    gap: 12,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalForm: {
    maxHeight: 500,
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
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  filterOptionSelected: {
    backgroundColor: '#2563EB',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterModalCloseButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterModalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});