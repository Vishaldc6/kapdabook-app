import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDatabase, initializeDatabase, resetDatabaseInstance } from '@/src/database/database';

export const exportDatabase = async () => {
  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/textile_billing_v2_temp.db`;

    // 1. Check DB exists
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!fileInfo.exists) {
      throw new Error('Database file not found');
    }

    // 2. Ask user where to save (Downloads / Files)
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      throw new Error('Storage permission not granted');
    }

    // 3. Create backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `textile_billing_backup_${timestamp}.db`;

    // 4. Create file in user-selected directory
    const backupUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        backupFilename,
        'application/octet-stream'
      );

    // 5. Read DB as Base64
    const dbBase64 = await FileSystem.readAsStringAsync(dbPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 6. Write DB to user-visible file
    await FileSystem.writeAsStringAsync(backupUri, dbBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 7. Create TEMP file for sharing (file://)
    const tempSharePath = `${FileSystem.cacheDirectory}${backupFilename}`;

    await FileSystem.writeAsStringAsync(tempSharePath, dbBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 8. Share temp file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tempSharePath, {
        dialogTitle: 'Share Database Backup',
        mimeType: 'application/x-sqlite3',
      });
    }

    return backupUri;
  } catch (error) {
    console.error('Error exporting database:', error);
    throw new Error('Failed to export database');
  }
};

export const importDatabase = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/octet-stream'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return false;

  const file = result.assets[0];

  if (!file.name.endsWith('.db')) {
    throw new Error('Invalid database file');
  }

  const dbPath = `${FileSystem.documentDirectory}SQLite/textile_billing_v2_temp.db`;

  // 1. Close current DB
  await resetDatabaseInstance();

  // 2. Replace DB file
  await FileSystem.deleteAsync(dbPath, { idempotent: true });
  await FileSystem.copyAsync({
    from: file.uri,
    to: dbPath,
  });

  // 3. Reinitialize DB (NO schema re-creation)
  await initializeDatabase();

  return true;
};

export const getDatabaseStats = async () => {
  try {
    const db = await getDatabase();
    
    const [buyerCount] = await db.getAllAsync('SELECT COUNT(*) as count FROM Buyer');
    const [dalalCount] = await db.getAllAsync('SELECT COUNT(*) as count FROM Dalal');
    const [materialCount] = await db.getAllAsync('SELECT COUNT(*) as count FROM Material');
    const [billCount] = await db.getAllAsync('SELECT COUNT(*) as count FROM Bill');
    const [pendingBills] = await db.getAllAsync('SELECT COUNT(*) as count FROM Bill WHERE payment_received = 0');
    const [totalRevenue] = await db.getAllAsync('SELECT SUM(base_amount + tax_amount) as total FROM Bill WHERE payment_received = 1');
    const [pendingAmount] = await db.getAllAsync('SELECT SUM(base_amount + tax_amount) as total FROM Bill WHERE payment_received = 0');
    
    return {
      buyers: (buyerCount as any).count,
      dalals: (dalalCount as any).count,
      materials: (materialCount as any).count,
      totalBills: (billCount as any).count,
      pendingBills: (pendingBills as any).count,
      totalRevenue: (totalRevenue as any).total || 0,
      pendingAmount: (pendingAmount as any).total || 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      buyers: 0,
      dalals: 0,
      materials: 0,
      totalBills: 0,
      pendingBills: 0,
      totalRevenue: 0,
      pendingAmount: 0
    };
  }
};