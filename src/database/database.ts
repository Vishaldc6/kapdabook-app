import * as SQLite from 'expo-sqlite';
import { createTables, insertDefaultData } from './schema';

let database: SQLite.SQLiteDatabase | null = null;
let initializing: Promise<SQLite.SQLiteDatabase> | null = null;

export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (database) return database;

  try {
    database = await SQLite.openDatabaseAsync('textile_billing_v2_temp.db');

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

export const getDatabase = async () => {
  if (database) return database;
  if (!initializing) {
    initializing = initializeDatabase();
  }
  return initializing;
};

// Database operations for Company
export const companyOperations = {
  getProfile: async () => {
    const db = await getDatabase();
    const [profile] = await db.getAllAsync('SELECT * FROM CompanyProfile LIMIT 1');
    return profile ?? null;
  },
  saveProfile: async (data: {
    name: string;
    tagline?: string;
    address: string;
    contact: string;
    gst: string;
    pan: string;
    business_type: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
    branch: string;
    termsConditions: string;
  }) => {
    const db = await getDatabase();

    // Check if profile already exists
    const [existing] = await db.getAllAsync(
      'SELECT id FROM CompanyProfile WHERE id = 1'
    );

    if (existing) {
      // UPDATE
      await db.runAsync(
        `
        UPDATE CompanyProfile SET
          name = ?,
          tagline = ?,
          address = ?,
          contact = ?,
          gst = ?,
          pan = ?,
          business_type = ?,
          bank_name = ?,
          account_no = ?,
          ifsc = ?,
          branch = ?,
          terms_conditions = ?
        WHERE id = 1
        `,
        [
          data.name,
          data.tagline ?? '',
          data.address,
          data.contact,
          data.gst,
          data.pan,
          data.business_type,
          data.bankName,
          data.accountNo,
          data.ifsc,
          data.branch,
          data.termsConditions,
        ]
      );
    } else {
      // INSERT (first time)
      await db.runAsync(
        `
        INSERT INTO CompanyProfile (
          id,
          name,
          tagline,
          address,
          contact,
          gst,
          pan,
          business_type,
          bank_name,
          account_no,
          ifsc,
          branch,
          terms_conditions
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.name,
          data.tagline ?? '',
          data.address,
          data.contact,
          data.gst,
          data.pan,
          data.business_type,
          data.bankName,
          data.accountNo,
          data.ifsc,
          data.branch,
          data.termsConditions,
        ]
      );
    }
  },
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
             buyer.address as buyer_address,
             buyer.gst_number as buyer_gst,
             dalal.name as dalal_name, 
             m.name as material_name,
             m.hsn_code as material_hsn_code,
             t.name as tax_name,
             t.percentage as tax_percentage,
             d.dhara_name,
             d.days as dhara_days,
             date(b.date, '+' || d.days || ' days') as due_date,
             (b.base_amount + b.tax_amount) as total_amount
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
             buyer.address as buyer_address,
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
             (b.base_amount + b.tax_amount) as total_amount
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
    bill_no: number;
    buyer_id: number;
    dalal_id: number;
    material_id: number;
    meter: number;
    price_rate: number;
    dhara_id: number;
    chalan_no: string;
    taka_count: number;
    tax_id: number;
    base_amount: number;
    tax_amount: number;
  }) => {
    const db = await getDatabase();
    const result = await db.runAsync(`
      INSERT INTO Bill (date, bill_no, buyer_id, dalal_id, material_id, meter, price_rate, dhara_id, chalan_no, taka_count, tax_id, base_amount, tax_amount, payment_received)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      bill.date,
      bill.bill_no,
      bill.buyer_id,
      bill.dalal_id,
      bill.material_id,
      bill.meter,
      bill.price_rate,
      bill.dhara_id,
      bill.chalan_no,
      bill.taka_count,
      bill.tax_id,
      bill.base_amount,
      bill.tax_amount,
    ]);
    return result.lastInsertRowId;
  },

  update: async (id: number, bill: {
    date: string;
    bill_no: number;
    buyer_id: number;
    dalal_id: number;
    material_id: number;
    meter: number;
    price_rate: number;
    dhara_id: number;
    chalan_no: string;
    taka_count: number;
    tax_id: number;
    base_amount: number;
    tax_amount: number;
  }) => {
    const db = await getDatabase();

    return await db.runAsync(`
      UPDATE Bill SET date = ?, bill_no = ?, buyer_id = ?, dalal_id = ?, material_id = ?, meter = ?, price_rate = ?, dhara_id = ?, chalan_no = ?, taka_count = ?, tax_id = ?, base_amount = ?, tax_amount = ? WHERE id = ?`,
      [
        bill.date,
        bill.bill_no,
        bill.buyer_id,
        bill.dalal_id,
        bill.material_id,
        bill.meter,
        bill.price_rate,
        bill.dhara_id,
        bill.chalan_no,
        bill.taka_count,
        bill.tax_id,
        bill.base_amount,
        bill.tax_amount,
        id,
      ]
    );
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