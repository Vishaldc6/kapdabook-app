import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Bill } from '@/src/types';

const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const convert = (n: number): string => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let words = convert(rupees) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + convert(paise) + ' Paise';
  }
  return words + ' Only';
};

export const generateBillPDF = async (bill: Bill) => {
  const companyInfo = {
    name: 'Vimal Textiles',
    tagline: 'Shree Ganeshay Namah',
    address: '127-128, Prabhudarshan Ind., Ved Road, Surat-395004',
    contact: 'Mo. 95109 88597',
    gst: 'GST NO. 24AKPPM0065J1Z1',
    pan: 'PAN NO. AKPPM0065J',
    businessType: 'MFG & Delers in Art Silk Cloth',
    bankName: 'The Sutex Co-operative Bank Ltd.',
    accountNo: '002010021001351',
    ifsc: 'SUTB0248020',
    branch: 'Jahangirpura'
  };

  const billDate = new Date(bill.date).toLocaleDateString('en-IN');
  const baseAmount = bill.meter * bill.price_rate;

  const gstPercentage = bill.tax_percentage || 10;
  const gstAmount = (baseAmount * gstPercentage) / 100;
  const totalAmount = baseAmount + gstAmount;

  let gstRows = `
    <tr>
      <td colspan="5" style="text-align: right; padding: 8px; font-weight: 600;">${bill.tax_name} @ ${bill.tax_percentage}%</td>
      <td style="text-align: right; padding: 8px;">₹${gstAmount.toFixed(2)}</td>
    </tr>
  `;

  const amountInWords = numberToWords(totalAmount);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Bill #${bill.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #000;
          font-size: 12px;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
          border: 2px solid #000;
          padding: 12px;
        }

        .company-name {
          font-size: 32px;
          font-weight: bold;
          color: #dc2626;
          font-style: italic;
          margin-bottom: 5px;
        }

        .tagline {
          font-size: 11px;
          margin-bottom: 5px;
        }

        .business-type {
          font-size: 13px;
          font-weight: 600;
          color: #dc2626;
          margin: 8px 0;
        }

        .company-details {
          font-size: 11px;
          line-height: 1.5;
        }

        .gst-pan {
          font-weight: 600;
          margin-top: 5px;
        }

        .invoice-title {
          background: #000;
          color: #fff;
          text-align: center;
          padding: 8px;
          font-size: 16px;
          font-weight: bold;
          margin: 15px 0;
        }

        .info-section {
          border: 1px solid #000;
          margin-bottom: 10px;
        }

        .info-row {
          display: flex;
          border-bottom: 1px solid #000;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          width: 120px;
          padding: 6px 8px;
          font-weight: 600;
          border-right: 1px solid #000;
        }

        .info-label:nth-child(3) {
          border-left: 1px solid #000;
        }

        .info-value {
          flex: 1;
          padding: 6px 8px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
          margin-bottom: 10px;
        }

        th {
          background: #4ade80;
          color: #000;
          padding: 8px;
          text-align: center;
          font-weight: 700;
          border: 1px solid #000;
        }

        td {
          padding: 8px;
          border: 1px solid #000;
        }

        .bank-details {
          border: 1px solid #000;
          padding: 10px;
          margin-bottom: 10px;
          font-size: 11px;
        }

        .bank-details div {
          margin-bottom: 3px;
        }

        .terms-section {
          border: 1px solid #000;
          padding: 10px;
          margin-bottom: 10px;
          font-size: 10px;
          width: 100%;
          display: inline-block;
          vertical-align: top;
        }

        .terms-title {
          font-weight: bold;
          margin-bottom: 8px;
          text-decoration: underline;
        }

        .terms-list {
          padding-left: 15px;
        }

        .terms-list li {
          margin-bottom: 5px;
        }

        .signature-box {
          width: 48%;
          height: 48%;
          border: 1px solid #000;
          padding: 15px;
          text-align: center;
          display: inline-block;
          vertical-align: top;
          margin-left: 4%;
        }

        .signature-line {
          margin-top: 50px;
          border-top: 1px solid #000;
          padding-top: 5px;
          font-weight: 600;
        }

        .amount-words {
          font-weight: 600;
          padding: 8px;
          background: #fef3c7;
          border: 1px solid #000;
          margin: 10px 0;
        }

        .total-row {
          background: #fef3c7;
          font-weight: 700;
          font-size: 14px;
        }

        .no-dyeing {
          font-style: italic;
          margin-top: 10px;
          font-size: 11px;
        }

        .footer-container {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .footer-left {
          flex: 1;
        }

        .footer-right {
          display: flex;
          text-align: right;
          gap: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="tagline">${companyInfo.tagline}</div>
        <div class="company-name">${companyInfo.name}</div>
        <div class="business-type">${companyInfo.businessType}</div>
        <div class="company-details">
          ${companyInfo.address}<br>
          ${companyInfo.contact}
        </div>
        <div class="gst-pan">
          ${companyInfo.gst}<br>
          ${companyInfo.pan}
        </div>
      </div>

      <div class="invoice-title">TAX INVOICE</div>

      <div class="info-section">
        <div class="info-row">
          <div class="info-label">Name</div>
          <div class="info-value">${bill.buyer_name}</div>
          <div class="info-label" style="width: 100px;">Bill No.</div>
          <div class="info-value" style="width: 120px;">${bill.id}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Address</div>
          <div class="info-value">-</div>
          <div class="info-label" style="width: 100px;">Invoice Date</div>
          <div class="info-value" style="width: 120px;">${billDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">GSTIN/UIN</div>
          <div class="info-value">${bill.buyer_gst || '-'}</div>
          <div class="info-label" style="width: 100px;">Ch No.</div>
          <div class="info-value" style="width: 120px;">${bill.chalan_no}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Brocker</div>
          <div class="info-value">${bill.dalal_name}</div>
          <div class="info-label" style="width: 100px;">Date</div>
          <div class="info-value" style="width: 120px;">${billDate}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">No.</th>
            <th>Description</th>
            <th style="width: 60px;">TAKA</th>
            <th style="width: 100px;">Qty.<br>in Meters</th>
            <th style="width: 80px;">Rate</th>
            <th style="width: 100px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">1</td>
            <td>
              ${bill.material_name}${bill.material_hsn_code ? `<br><small>HSN: ${bill.material_hsn_code}</small>` : ''}
            </td>
            <td style="text-align: center;">${bill.taka_count}</td>
            <td style="text-align: right;">${bill.meter.toFixed(2)}</td>
            <td style="text-align: right;">₹${bill.price_rate.toFixed(2)}</td>
            <td style="text-align: right;">₹${baseAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align: right; padding: 8px; font-weight: 600;">Total</td>
            <td style="text-align: right; padding: 8px; font-weight: 600;">₹${baseAmount.toFixed(2)}</td>
          </tr>
          ${gstRows}
          <tr class="total-row">
            <td colspan="5" style="text-align: right; padding: 10px;">Total</td>
            <td style="text-align: right; padding: 10px;">₹${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="amount-words">
        Amount in Words: ${amountInWords}
      </div>

      <div class="footer-container">
        <div class="footer-left">
          <div class="bank-details">
            <strong>${companyInfo.bankName}</strong><br>
            A/c No.: ${companyInfo.accountNo}<br>
            IFSC: ${companyInfo.ifsc}<br>
            Branch: ${companyInfo.branch}
          </div>

          <div class="terms-section">
            <div class="terms-title">Terms & Conditions</div>
            <ol class="terms-list">
              <li>No claim of dispute arising from charge in quality or shortage in meters or any cash what so ever will be entertained once the goods are delivered.</li>
              <li>The payment of this should be made in case against delivery filling which the interest at 24% per month shall be charge from date of bill.</li>
              <li>The goods are Despatched at your Risk.</li>
              <li>Subject to Surat Jurisdiction.</li>
            </ol>
          </div>

          <div class="no-dyeing">No Dyeing Guarantee</div>
        </div>

        <div class="footer-right">
          <div class="signature-box">
            <div style="text-align: right; font-weight: 600; margin-bottom: 10px;">
              For, ${companyInfo.name}
            </div>
            <div class="signature-line">
              Authorise Representative
            </div>
          </div>
          <div class="signature-box">
            <div style="text-align: right; font-weight: 600; margin-bottom: 10px;">
              Receiver's Signature
            </div>
            <div class="signature-line">
              Signature
            </div>
          </div>
        </div>
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