/**
 * GST Computation Utility for GSTR-3B Generation
 * Handles parsing of raw transaction data and applying Indian GST rules.
 */

export function computeGSTR3B(transactions, clientInfo) {
  const return_period = clientInfo.period || "04-2024";
  const gstin = clientInfo.gstin;
  const legal_name = clientInfo.client_name;
  const filing_frequency = clientInfo.filing_frequency;
  const supplier_state_code = gstin.substring(0, 2);

  const outward = {
    rate_0: { taxable_value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    rate_5: { taxable_value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    rate_12: { taxable_value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    rate_18: { taxable_value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    rate_28: { taxable_value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    total: { taxable_value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }
  };

  const itc = {
    import_of_goods: { igst: 0, cess: 0 },
    import_of_services: { igst: 0, cess: 0 },
    inward_reverse_charge: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
    all_other_itc: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
    total_itc_available: { igst: 0, cgst: 0, sgst: 0, cess: 0 }
  };

  const hsn_summary = {};
  const verification_trail = [];

  let sales_count = 0;
  let purchase_count = 0;
  let b2b_count = 0;
  let b2c_count = 0;
  let interstate_count = 0;
  let intrastate_count = 0;

  transactions.forEach(tx => {
    const isSale = tx.type === 'Sales' || tx.type === 'Sale';
    const taxableValue = parseFloat(tx.taxable_value || 0);
    const rate = parseInt(tx.rate || 0);
    const buyerGSTIN = tx.gstin || '';
    const isInterstate = buyerGSTIN && buyerGSTIN.substring(0, 2) !== supplier_state_code;

    if (isSale) {
      sales_count++;
      if (buyerGSTIN) b2b_count++; else b2c_count++;
      if (isInterstate) interstate_count++; else intrastate_count++;

      const rateKey = `rate_${rate}`;
      if (outward[rateKey]) {
        outward[rateKey].taxable_value += taxableValue;
        if (isInterstate) {
          outward[rateKey].igst += taxableValue * (rate / 100);
        } else {
          outward[rateKey].cgst += taxableValue * (rate / 200);
          outward[rateKey].sgst += taxableValue * (rate / 200);
        }
      }

      // HSN Summary
      if (tx.hsn) {
        if (!hsn_summary[tx.hsn]) {
          hsn_summary[tx.hsn] = { hsn_code: tx.hsn, description: tx.description, uqc: tx.uqc, total_quantity: 0, taxable_value: 0, tax_rate: rate, igst: 0, cgst: 0, sgst: 0 };
        }
        hsn_summary[tx.hsn].total_quantity += parseFloat(tx.quantity || 0);
        hsn_summary[tx.hsn].taxable_value += taxableValue;
        if (isInterstate) hsn_summary[tx.hsn].igst += taxableValue * (rate / 100);
        else {
          hsn_summary[tx.hsn].cgst += taxableValue * (rate / 200);
          hsn_summary[tx.hsn].sgst += taxableValue * (rate / 200);
        }
      }

      verification_trail.push({
        invoice_no: tx.invoice_no,
        party_name: tx.party_name,
        gstin: buyerGSTIN || 'N/A',
        taxable_value: taxableValue,
        tax_type: isInterstate ? 'IGST' : 'CGST+SGST',
        tax_rate: rate,
        tax_amount: taxableValue * (rate / 100),
        category: `${buyerGSTIN ? 'B2B' : 'B2C'} ${isInterstate ? 'Interstate' : 'Intrastate'}`
      });
    } else {
      purchase_count++;
      itc.all_other_itc.igst += parseFloat(tx.igst || 0);
      itc.all_other_itc.cgst += parseFloat(tx.cgst || 0);
      itc.all_other_itc.sgst += parseFloat(tx.sgst || 0);
    }
  });

  // Calculate Totals
  ['0', '5', '12', '18', '28'].forEach(r => {
    const k = `rate_${r}`;
    outward.total.taxable_value += outward[k].taxable_value;
    outward.total.igst += outward[k].igst;
    outward.total.cgst += outward[k].cgst;
    outward.total.sgst += outward[k].sgst;
  });

  itc.total_itc_available.igst = itc.all_other_itc.igst;
  itc.total_itc_available.cgst = itc.all_other_itc.cgst;
  itc.total_itc_available.sgst = itc.all_other_itc.sgst;

  const net_tax_liability = {
    igst: outward.total.igst - itc.total_itc_available.igst,
    cgst: outward.total.cgst - itc.total_itc_available.cgst,
    sgst: outward.total.sgst - itc.total_itc_available.sgst,
    cess: 0
  };

  return {
    return_period,
    gstin,
    legal_name,
    filing_frequency,
    table_3_1_outward_taxable_supplies: outward,
    table_4_itc_available: itc,
    net_tax_liability,
    table_12_hsn_summary: Object.values(hsn_summary),
    computation_summary: {
      total_invoices_processed: sales_count + purchase_count,
      total_sales_invoices: sales_count,
      total_purchase_invoices: purchase_count,
      b2b_invoices: b2b_count,
      b2c_invoices: b2c_count,
      interstate_sales: interstate_count,
      intrastate_sales: intrastate_count
    },
    verification_trail
  };
}
