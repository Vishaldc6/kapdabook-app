import * as SQLite from 'expo-sqlite';
import { createTables, insertDefaultData } from './schema';

let database: SQLite.SQLiteDatabase | null = null;

export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (database) return database;

  try {
    database = await SQLite.openDatabaseAsync('textile_billing_v1.db');

    // Enable foreign keys
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Create tables
    await database.execAsync(createTables);

    // Insert default data
    await database.execAsync(insertDefaultData);

    console.log('Database initialized successfully');
    return database;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!database) {
    return await initializeDatabase();
  }
  return database;
};

// Database operations for Buyers
export const buyerOperations = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM Buyer ORDER BY name');
  },

  getById: async (id: number) => {
    const db = await getDatabase();
    return await db.getFirstAsync('SELECT * FROM Buyer WHERE id = ?', [id]);
  },

  create: async (buyer: { name: string; address?: string; contact_number: string; gst_number?: string }) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Buyer (name, address, contact_number, gst_number) VALUES (?, ?, ?, ?)',
      [buyer.name, buyer.address || null, buyer.contact_number, buyer.gst_number || null]
    );
    return result.lastInsertRowId;
  },

  update: async (id: number, buyer: { name: string; address?: string; contact_number: string; gst_number?: string }) => {
    const db = await getDatabase();
    return await db.runAsync(
      'UPDATE Buyer SET name = ?, address = ?, contact_number = ?, gst_number = ? WHERE id = ?',
      [buyer.name, buyer.address || null, buyer.contact_number, buyer.gst_number || null, id]
    );
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('DELETE FROM Buyer WHERE id = ?', [id]);
  }
};

// Database operations for Dalals
export const dalalOperations = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM Dalal ORDER BY name');
  },

  getById: async (id: number) => {
    const db = await getDatabase();
    return await db.getFirstAsync('SELECT * FROM Dalal WHERE id = ?', [id]);
  },

  create: async (dalal: { name: string; contact_number: string; address?: string }) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Dalal (name, contact_number, address) VALUES (?, ?, ?)',
      [dalal.name, dalal.contact_number, dalal.address || null]
    );
    return result.lastInsertRowId;
  },

  update: async (id: number, dalal: { name: string; contact_number: string; address?: string }) => {
    const db = await getDatabase();
    return await db.runAsync(
      'UPDATE Dalal SET name = ?, contact_number = ?, address = ? WHERE id = ?',
      [dalal.name, dalal.contact_number, dalal.address || null, id]
    );
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('DELETE FROM Dalal WHERE id = ?', [id]);
  }
};

// Database operations for Materials
export const materialOperations = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM Material ORDER BY name');
  },

  create: async (material: { name: string; extra_detail?: string; hsn_code?: string }) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Material (name, extra_detail, hsn_code) VALUES (?, ?, ?)',
      [material.name, material.extra_detail || null, material.hsn_code || null]
    );
    return result.lastInsertRowId;
  },

  update: async (id: number, material: { name: string; extra_detail?: string, hsn_code?: string }) => {
    const db = await getDatabase();
    return await db.runAsync(
      'UPDATE Material SET name = ?, extra_detail = ?, hsn_code = ? WHERE id = ?',
      [material.name, material.extra_detail || null, material.hsn_code || null, id]
    );
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('DELETE FROM Material WHERE id = ?', [id]);
  }
};

// Database operations for Dhara
export const dharaOperations = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.getAllAsync('SELECT * FROM Dhara ORDER BY days');
  },

  getById: async (id: number) => {
    const db = await getDatabase();
    return await db.getFirstAsync('SELECT * FROM Dhara WHERE id = ?', [id]);
  },

  create: async (dhara: { dhara_name: string; days: number }) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Dhara (dhara_name, days) VALUES (?, ?)',
      [dhara.dhara_name, dhara.days]
    );
    return result.lastInsertRowId;
  },

  update: async (id: number, dhara: { dhara_name: string; days: number }) => {
    const db = await getDatabase();
    return await db.runAsync(
      'UPDATE Dhara SET dhara_name = ?, days = ? WHERE id = ?',
      [dhara.dhara_name, dhara.days, id]
    );
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('DELETE FROM Dhara WHERE id = ?', [id]);
  }
};

// Database operations for Taxes
export const taxOperations = {
  getAll: async () => {
    try {
      const db = await getDatabase();
      return await db.getAllAsync('SELECT * FROM Tax ORDER BY name');
    } catch (error) {
      console.error('Failed to get Tax:', error);
      throw error;
    }
  },

  create: async (tax: { name: string; percentage: number }) => {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Tax (name, percentage) VALUES (?, ?)',
      [tax.name, tax.percentage || 0]
    );
    return result.lastInsertRowId;
  },

  update: async (id: number, tax: { name: string; percentage: number }) => {
    const db = await getDatabase();
    return await db.runAsync(
      'UPDATE Tax SET name = ?, percentage = ? WHERE id = ?',
      [tax.name, tax.percentage || 0, id]
    );
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('DELETE FROM Tax WHERE id = ?', [id]);
  }
};

// Database operations for Bills
export const billOperations = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.getAllAsync(`
      SELECT b.*, 
             buyer.name as buyer_name,
             buyer.gst_number as buyer_gst,
             dalal.name as dalal_name, 
             m.name as material_name,
             m.hsn_code as material_hsn_code,
             t.name as tax_name,
             t.percentage as tax_percentage,
             d.dhara_name,
             d.days as dhara_days,
             date(b.date, '+' || d.days || ' days') as due_date,
             (b.meter * b.price_rate) as total_amount
      FROM Bill b
      JOIN Buyer buyer ON b.buyer_id = buyer.id
      JOIN Dalal dalal ON b.dalal_id = dalal.id  
      JOIN Material m ON b.material_id = m.id
      JOIN Dhara d ON b.dhara_id = d.id
      JOIN Tax t ON b.tax_id = t.id
      ORDER BY b.date DESC
    `);
  },

  getPendingBills: async () => {
    const db = await getDatabase();
    return await db.getAllAsync(`
      SELECT b.*, 
             buyer.name as buyer_name,
             buyer.gst_number as buyer_gst,
             dalal.name as dalal_name,
             m.name as material_name,
             m.hsn_code as material_hsn_code,
             t.name as tax_name,
             t.percentage as tax_percentage,
             d.dhara_name,
             d.days as dhara_days,
             date(b.date, '+' || d.days || ' days') as due_date,
             (julianday(date(b.date, '+' || d.days || ' days')) - julianday('now')) as days_to_due,
             (b.meter * b.price_rate) as total_amount
      FROM Bill b
      JOIN Buyer buyer ON b.buyer_id = buyer.id
      JOIN Dalal dalal ON b.dalal_id = dalal.id
      JOIN Material m ON b.material_id = m.id  
      JOIN Dhara d ON b.dhara_id = d.id
      JOIN Tax t ON b.tax_id = t.id
      WHERE b.payment_received = 0
      ORDER BY days_to_due ASC
    `);
  },

  create: async (bill: {
    date: string;
    buyer_id: number;
    dalal_id: number;
    material_id: number;
    meter: number;
    price_rate: number;
    dhara_id: number;
    chalan_no: string;
    taka_count: number;
    tax_id: number;
  }) => {
    const db = await getDatabase();
    const result = await db.runAsync(`
      INSERT INTO Bill (date, buyer_id, dalal_id, material_id, meter, price_rate, dhara_id, chalan_no, taka_count, tax_id, payment_received)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,0)
    `, [
      bill.date,
      bill.buyer_id,
      bill.dalal_id,
      bill.material_id,
      bill.meter,
      bill.price_rate,
      bill.dhara_id,
      bill.chalan_no,
      bill.taka_count,
      bill.tax_id,
    ]);
    return result.lastInsertRowId;
  },

  markAsPaid: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('UPDATE Bill SET payment_received = 1 WHERE id = ?', [id]);
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    return await db.runAsync('DELETE FROM Bill WHERE id = ?', [id]);
  }
};