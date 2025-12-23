import BillCard from '@/src/components/BillCard';
import { billOperations, companyOperations } from '@/src/database/database';
import { useLanguage } from '@/src/hook/useLanguage';
import { Bill, CompanyProfile } from '@/src/types';
import { getDatabaseStats } from '@/src/utils/backup';
import { generateBillPDF } from '@/src/utils/pdfGenerator';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { TriangleAlert as AlertTriangle, Calendar, IndianRupee, TrendingUp, Users } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { t } = useLanguage();
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState({
    buyers: 0,
    dalals: 0,
    materials: 0,
    totalBills: 0,
    pendingBills: 0,
    totalRevenue: 0,
    pendingAmount: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  const loadData = async () => {
    try {
      const [bills, dbStats] = await Promise.all([
        billOperations.getPendingBills(),
        getDatabaseStats()
      ]);

      // Filter bills due within 5 days or overdue
      const urgentBills: Bill[] = bills.filter((bill: Bill) =>
        bill.days_to_due !== undefined && bill.days_to_due <= 5
      );

      setPendingBills(urgentBills);
      setStats(dbStats);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      checkProfileCompleted();
    }, [])
  );

  const checkProfileCompleted = async () => {
    const companyInfo = await companyOperations.getProfile() as CompanyProfile;
    console.log({ companyInfo: companyInfo ? true : false });
    if (!!companyInfo) {
      setProfileCompleted(false)
    } else {
      setProfileCompleted(true)
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleGeneratePDF = async (bill: Bill) => {
    try {
      await generateBillPDF(bill);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleDelete = (bill: Bill) => {
    Alert.alert(
      t('deleteBill'),
      t('deleteBillConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await billOperations.delete(bill.id);
              loadData();
              Alert.alert(t('success'), t('billDeleted'));
            } catch (error) {
              Alert.alert(t('error'), t('failedToDeleteBill'));
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton />
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('textileBillingDashboard')}</Text>
          <Text style={styles.subtitle}>{t('welcomeBack')}</Text>
        </View>
      </View>

      {profileCompleted && <View style={[styles.summaryCard, styles.warningCard]}>
        <Text style={styles.warningTax}>{t('completeProfileForPDF')}</Text>
      </View>}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={24} color="#10B981" />
              <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
            </View>
            <Text style={styles.statLabel}>{t('totalRevenue')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <IndianRupee size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{formatCurrency(stats.pendingAmount)}</Text>
            </View>
            <Text style={styles.statLabel}>{t('pendingAmount')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Users size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{stats.buyers}</Text>
            </View>
            <Text style={styles.statLabel}>{t('totalBuyers')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Calendar size={24} color="#EF4444" />
              <Text style={styles.statValue}>{stats.totalBills}</Text>
            </View>
            <Text style={styles.statLabel}>{t('totalBills')}</Text>
          </View>
        </View>

        {/* Urgent Bills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>{t('urgentBills')}</Text>
          </View>

          {pendingBills.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('noUrgentBills')}</Text>
              <Text style={styles.emptySubtext}>{t('allPaymentsUpToDate')}</Text>
            </View>
          ) : (
            <View style={styles.billsList}>
              {pendingBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onUpdate={loadData}
                  onGeneratePDF={handleGeneratePDF}
                  handleDelete={handleDelete}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickSummary')}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('pendingBills')}</Text>
              <Text style={styles.summaryValue}>{stats.pendingBills}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('totalDalals')}</Text>
              <Text style={styles.summaryValue}>{stats.dalals}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('materialTypes')}</Text>
              <Text style={styles.summaryValue}>{stats.materials}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  billsList: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  warningTax: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
  },
  warningCard: {
    margin: 16,
    marginBottom: 0
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
});