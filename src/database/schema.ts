export const createTables = `
  -- Create Company Profile table
  CREATE TABLE IF NOT EXISTS CompanyProfile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    tagline TEXT,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    gst TEXT NOT NULL,
    pan TEXT NOT NULL,
    business_type TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_no TEXT NOT NULL,
    ifsc TEXT NOT NULL,
    branch TEXT NOT NULL,
    terms_conditions TEXT NOT NULL
  );

  -- Create Buyer table
  CREATE TABLE IF NOT EXISTS Buyer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    contact_number TEXT NOT NULL,
    gst_number TEXT
  );

  -- Create Dalal table  
  CREATE TABLE IF NOT EXISTS Dalal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    address TEXT
  );

  -- Create Material table
  CREATE TABLE IF NOT EXISTS Material (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    extra_detail TEXT,
    hsn_code TEXT
  );

  -- Create Dhara table
  CREATE TABLE IF NOT EXISTS Dhara (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dhara_name TEXT NOT NULL,
    days INTEGER NOT NULL
  );

   -- Create Tax table
  CREATE TABLE IF NOT EXISTS Tax (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    percentage INTEGER NOT NULL
  );

  -- Create Bill table
  CREATE TABLE IF NOT EXISTS Bill (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    buyer_id INTEGER NOT NULL,
    dalal_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    meter REAL NOT NULL,
    price_rate REAL NOT NULL,
    dhara_id INTEGER NOT NULL,
    chalan_no TEXT NOT NULL,
    taka_count INTEGER NOT NULL,
    payment_received BOOLEAN DEFAULT 0,
    tax_id INTEGER NOT NULL,
    base_amount REAL NOT NULL,
    tax_amount REAL NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES Buyer(id),
    FOREIGN KEY (dalal_id) REFERENCES Dalal(id),
    FOREIGN KEY (material_id) REFERENCES Material(id),
    FOREIGN KEY (dhara_id) REFERENCES Dhara(id),
    FOREIGN KEY (tax_id) REFERENCES Tax(id)
  );
`;

export const insertDefaultData = `
  INSERT OR IGNORE INTO Dhara (id, dhara_name, days) VALUES 
    (1, 'Regular (35 days)', 35),
    (2, 'War to War (10 days)', 10),
    (3, 'Cash (0 days)', 0),
    (4, 'Extended (60 days)', 60);

  INSERT OR IGNORE INTO Material (id, name, extra_detail, hsn_code) VALUES
    (1, 'Cotton', 'Premium quality cotton fabric', '52010000'),
    (2, 'Polyester', 'Synthetic blend material', '52020000'),
    (3, 'Silk', 'Natural silk fabric', '52030000'),
    (4, 'Wool', 'Pure wool material', '52040000');

  INSERT OR IGNORE INTO Tax (id, name, percentage) VALUES
    (1, 'IGST', 10),
    (2, 'SGST & CGST', 10);
    `;
/*   
INSERT OR IGNORE INTO Buyer (id, name, address, contact_number, gst_number ) VALUES
         (1, 'Jalaram ltd.', 'Adajan, Surat', '8574968596', 'DEFG446734'),
         (2, 'Shrusti pvt ltd', 'Vesu, Surat', '9898969858', 'HGTU231975');

       INSERT OR IGNORE INTO Dalal (id, name, address, contact_number ) VALUES
         (1, 'Kishan Patel', 'Katargam, Surat', '7418529635'),
         (2, 'Ramesh Rathod', 'VIP road, Navasari', '796584569');

     INSERT OR IGNORE INTO Bill (date, buyer_id, dalal_id, material_id, meter, price_rate, dhara_id, chalan_no, taka_count, payment_received, tax_id, base_amount, tax_amount ) VALUES
         ('2025-08-05', 2, 1, 3, 50, 200, 2, 8526, 120, 0, 1, 10000, 1000),
         ('2025-09-04', 1, 1, 1, 100, 50, 1, 7485, 200, 1, 2, 10000, 1000);
*/