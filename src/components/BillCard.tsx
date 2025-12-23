import { billOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Bill } from '@/src/types';
import { Calendar, CircleCheck as CheckCircle, Edit, FileText, IndianRupee, Package, Trash2, User } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BillCardProps {
  bill: Bill;
  onUpdate: () => void;
  onGeneratePDF: (bill: Bill) => void;
  onEdit?: (bill: Bill) => void;
  handleDelete: (bill: Bill) => void;
}

export default function BillCard({ bill, onUpdate, onGeneratePDF, onEdit, handleDelete }: BillCardProps) {
  const { t } = useLanguage();
  const daysTodue = bill.days_to_due || 0;
  const isOverdue = daysTodue < 0;
  const isDueSoon = daysTodue >= 0 && daysTodue <= 5;

  const getStatusColor = () => {
    if (bill.payment_received) return '#10B944';
    if (isOverdue) return '#EF4444';
    if (isDueSoon) return '#F59E0B';
    return '#6B7280';
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      t('markAsPaid'),
      t('markBillPaid', { id: bill.id }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('markPaid'),
          onPress: async () => {
            try {
              await billOperations.markAsPaid(bill.id);
              onUpdate();
            } catch (error) {
              Alert.alert(t('error'), 'Failed to update bill');
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.header}>
        <Text style={styles.billNumber}>Bill #{bill.id}</Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {bill.payment_received ? 'PAID' : isOverdue ? 'OVERDUE' : isDueSoon ? 'DUE SOON' : 'PENDING'}
        </Text>
      </View>

      <View style={styles.row}>
        <User size={16} color="#6B7280" />
        <Text style={styles.label}>{t('buyer')}:</Text>
        <Text style={styles.value}>{bill.buyer_name}</Text>
      </View>

      <View style={styles.row}>
        <User size={16} color="#6B7280" />
        <Text style={styles.label}>{t('dalal')}:</Text>
        <Text style={styles.value}>{bill.dalal_name}</Text>
      </View>

      <View style={styles.row}>
        <Package size={16} color="#6B7280" />
        <Text style={styles.label}>{t('material')}:</Text>
        <Text style={styles.value}>{bill.material_name}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('meter')}:</Text>
        <Text style={styles.value}>{bill.meter}</Text>
        <Text style={styles.label}>{t('priceRate')}:</Text>
        <Text style={styles.value}>₹{bill.price_rate}</Text>
      </View>

      <View style={styles.row}>
        <IndianRupee size={16} color="#6B7280" />
        <Text style={styles.label}>Amount:</Text>
        <Text style={[styles.amount, { color: getStatusColor() }]}>
          {formatAmount(bill.total_amount || 0)}
        </Text>
      </View>

      <View style={styles.row}>
        <Calendar size={16} color="#6B7280" />
        <Text style={styles.label}>Due Date:</Text>
        <Text style={[styles.value, { color: getStatusColor() }]}>
          {new Date(bill.due_date || '').toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('paymentTerms')}:</Text>
        <Text style={styles.value}>{bill.dhara_name}</Text>
      </View>

      <View style={styles.actions}>
        {!bill.payment_received && (
          <TouchableOpacity style={[styles.button, styles.payButton]} onPress={handleMarkAsPaid}>
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t('markPaid')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.pdfButton]} onPress={() => onGeneratePDF(bill)}>
          <FileText size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>{t('generatePDF')}</Text>
        </TouchableOpacity>

      </View>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => onEdit(bill)}>
            <Edit size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>{t('updateBill')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDelete(bill)}>
          <Trash2 size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>{t('deleteBill')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400',
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: '50%',
    gap: 4,
    flex: 1,
  },
  payButton: {
    backgroundColor: '#10B944'
  },
  pdfButton: {
    backgroundColor: '#F59E0B'
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444'
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});