import { Language, useLanguage } from '@/src/hook/useLanguage';
import { exportDatabase, getDatabaseStats } from '@/src/utils/backup';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { ChartBar as BarChart3, Database, Download, Package, Receipt, Settings as SettingsIcon, User, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [stats, setStats] = useState({
    buyers: 0,
    dalals: 0,
    materials: 0,
    totalBills: 0,
    pendingBills: 0,
    totalRevenue: 0,
    pendingAmount: 0
  });
  const [exporting, setExporting] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dbStats = await getDatabaseStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleExportDatabase = async () => {
    setExporting(true);
    try {
      await exportDatabase();
      Alert.alert(
        t('exportSuccessful'),
        t('exportSuccessfulDesc')
      );
    } catch (error) {
      Alert.alert(
        t('exportFailed'),
        t('exportFailedDesc')
      );
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ icon, title, value, color }: {
    icon: React.ReactNode,
    title: string,
    value: string | number,
    color: string
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  const LanguageOption = ({ lang, label }: { lang: Language; label: string }) => (
    <TouchableOpacity
      style={[styles.languageOption, language === lang && styles.languageOptionSelected]}
      onPress={() => {
        setLanguage(lang);
        setLanguageModalVisible(false);
      }}
    >
      <Text style={[styles.languageOptionText, language === lang && styles.languageOptionTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton />
        <View style={styles.headerContent}>
          <SettingsIcon size={24} color="#2563EB" />
          <Text style={styles.title}>{t('settingsAnalytics')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Database Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('databaseOverview')}</Text>

          <View style={styles.statsGrid}>
            <StatCard
              icon={<Users size={24} color="#3B82F6" />}
              title={t('totalBuyers')}
              value={stats.buyers}
              color="#3B82F6"
            />
            <StatCard
              icon={<User size={24} color="#8B5CF6" />}
              title={t('totalDalals')}
              value={stats.dalals}
              color="#8B5CF6"
            />
            <StatCard
              icon={<Package size={24} color="#10B981" />}
              title={t('materialTypes')}
              value={stats.materials}
              color="#10B981"
            />
            <StatCard
              icon={<Receipt size={24} color="#F59E0B" />}
              title={t('totalBills')}
              value={stats.totalBills}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('financialSummary')}</Text>

          <View style={styles.financialCards}>
            <View style={[styles.financialCard, { backgroundColor: '#D1FAE5' }]}>
              <View style={styles.financialHeader}>
                <BarChart3 size={24} color="#059669" />
                <Text style={[styles.financialTitle, { color: '#059669' }]}>{t('totalRevenue')}</Text>
              </View>
              <Text style={[styles.financialAmount, { color: '#059669' }]}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
            </View>

            <View style={[styles.financialCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={styles.financialHeader}>
                <BarChart3 size={24} color="#D97706" />
                <Text style={[styles.financialTitle, { color: '#D97706' }]}>{t('pendingAmount')}</Text>
              </View>
              <Text style={[styles.financialAmount, { color: '#D97706' }]}>
                {formatCurrency(stats.pendingAmount)}
              </Text>
              <Text style={[styles.financialSubtext, { color: '#92400E' }]}>
                {stats.pendingBills} {t('pendingBillsFilter').toLowerCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setLanguageModalVisible(true)}
          >
            <SettingsIcon size={24} color="#6B7280" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{t('selectLanguage')}</Text>
              <Text style={styles.actionDescription}>
                {language === 'en' ? t('english') : t('hindi')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Backup & Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dataManagement')}</Text>

          <View style={styles.actionCard}>
            <Database size={24} color="#6B7280" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{t('databaseBackup')}</Text>
              <Text style={styles.actionDescription}>
                {t('databaseBackupDesc')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exportButton, { opacity: exporting ? 0.5 : 1 }]}
              onPress={handleExportDatabase}
              disabled={exporting}
            >
              <Download size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>
                {exporting ? t('exporting') : t('export')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appInformation')}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('version')}</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('databaseEngine')}</Text>
              <Text style={styles.infoValue}>SQLite</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('platform')}</Text>
              <Text style={styles.infoValue}>React Native</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('lastBackup')}</Text>
              <Text style={styles.infoValue}>{t('never')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.languageModalOverlay}>
          <View style={styles.languageModalContent}>
            <Text style={styles.languageModalTitle}>{t('selectLanguage')}</Text>

            <LanguageOption lang="en" label={t('english')} />
            <LanguageOption lang="hi" label={t('hindi')} />

            <TouchableOpacity
              style={styles.languageModalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.languageModalCloseText}>{t('cancel')}</Text>
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  financialCards: {
    gap: 12,
  },
  financialCard: {
    borderRadius: 12,
    padding: 20,
  },
  financialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  financialAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  financialSubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  languageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  languageModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  languageOptionSelected: {
    backgroundColor: '#2563EB',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  languageOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  languageModalCloseButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  languageModalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});