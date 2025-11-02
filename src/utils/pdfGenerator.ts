import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Bill } from '@/types';

export const generateBillPDF = async (bill: Bill, companyInfo = {
  name: 'Textile Trading Company',
  address: '123 Textile Street, Business District',
  contact: '+91 9876543210',
  gst: '27AABCT1234567890',
  email: 'info@textiletrading.com'
}) => {
  const currentDate = new Date().toLocaleDateString();
  const dueDate = new Date(bill.due_date || '').toLocaleDateString();
  const billDate = new Date(bill.date).toLocaleDateString();
  const totalAmount = bill.total_amount || (bill.meter * bill.price_rate);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Bill #${bill.id}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        
        .company-details {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 10px;
        }
        
        .bill-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .info-section {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .label {
          font-weight: 500;
          color: #6b7280;
        }
        
        .value {
          font-weight: 600;
          color: #1f2937;
        }
        
        .bill-details {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .bill-details th {
          background: #2563eb;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
        }
        
        .bill-details td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .bill-details tr:last-child td {
          border-bottom: none;
        }
        
        .total-section {
          margin-top: 30px;
          text-align: right;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 18px;
        }
        
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
          background: #d1fae5;
          padding: 15px 25px;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .paid {
          background: #d1fae5;
          color: #059669;
        }
        
        .pending {
          background: #fef3c7;
          color: #d97706;
        }
        
        .overdue {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          body { margin: 0; padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${companyInfo.name}</div>
        <div class="company-details">
          ${companyInfo.address}<br>
          Contact: ${companyInfo.contact} | Email: ${companyInfo.email}<br>
          GST No: ${companyInfo.gst}
        </div>
      </div>
      
      <div class="bill-info">
        <div class="info-section">
          <div class="section-title">Bill Information</div>
          <div class="info-row">
            <span class="label">Bill No:</span>
            <span class="value">#${bill.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Bill Date:</span>
            <span class="value">${billDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Due Date:</span>
            <span class="value">${dueDate}</span>
          </div>
          <div class="info-row">
            <span class="label">Chalan No:</span>
            <span class="value">${bill.chalan_no}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Terms:</span>
            <span class="value">${bill.dhara_name}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge ${bill.payment_received ? 'paid' : (bill.days_to_due && bill.days_to_due < 0) ? 'overdue' : 'pending'}">
              ${bill.payment_received ? 'PAID' : (bill.days_to_due && bill.days_to_due < 0) ? 'OVERDUE' : 'PENDING'}
            </span>
          </div>
        </div>
        
        <div class="info-section">
          <div class="section-title">Buyer Information</div>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">${bill.buyer_name}</span>
          </div>
          <div class="info-row">
            <span class="label">Contact:</span>
            <span class="value">Available on request</span>
          </div>
          <br>
          <div class="section-title">Dalal Information</div>
          <div class="info-row">
            <span class="label">Name:</span>
            <span class="value">${bill.dalal_name}</span>
          </div>
          <div class="info-row">
            <span class="label">Contact:</span>
            <span class="value">Available on request</span>
          </div>
        </div>
      </div>
      
      <table class="bill-details">
        <thead>
          <tr>
            <th>Material</th>
            <th>Quantity (Meters)</th>
            <th>Rate per Meter</th>
            <th>Taka Count</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${bill.material_name}</td>
            <td>${bill.meter}</td>
            <td>₹${bill.price_rate}</td>
            <td>${bill.taka_count}</td>
            <td>₹${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">
          <strong>Total Amount:</strong>
          <div class="total-amount">
            ₹${totalAmount.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${currentDate} | This is a computer-generated bill</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Bill #${bill.id} - ${bill.buyer_name}`
      });
    }
    
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};