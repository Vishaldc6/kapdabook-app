import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '@/src/database/database';

export const exportDatabase = async () => {
  try {
    // Get database file path
    const dbPath = `${FileSystem.documentDirectory}SQLite/textile_billing_v2_temp.db`;
    
    // Check if database file exists
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!fileInfo.exists) {
      throw new Error('Database file not found');
    }
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `textile_billing_v2_temp_backup_${timestamp}.db`;
    const backupPath = `${FileSystem.documentDirectory}${backupFilename}`;
    
    // Copy database file to backup location
    await FileSystem.copyAsync({
      from: dbPath,
      to: backupPath
    });
    
    // Share the backup file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(backupPath, {
        UTI: '.db',
        mimeType: 'application/x-sqlite3',
        dialogTitle: 'Export Database Backup'
      });
    }
    
    return backupPath;
  } catch (error) {
    console.error('Error exporting database:', error);
    throw new Error('Failed to export database');
  }
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