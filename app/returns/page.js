'use client';

import { useState, useEffect } from 'react';
import { computeGSTR3B } from '../../lib/gst-calculator';

import * as XLSX from 'xlsx';

export default function ReturnsPage() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [returnResult, setReturnResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    }
    fetchClients();
  }, []);

  const exportToExcel = () => {
    if (!returnResult) return;

    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      ["GSTR-3B Computation Summary", ""],
      ["Period", returnResult.return_period],
      ["Client Name", returnResult.legal_name],
      ["GSTIN", returnResult.gstin],
      ["Filing Frequency", returnResult.filing_frequency],
      ["", ""],
      ["Net Tax Liability", ""],
      ["IGST", returnResult.net_tax_liability.igst],
      ["CGST", returnResult.net_tax_liability.cgst],
      ["SGST", returnResult.net_tax_liability.sgst],
      ["Cess", returnResult.net_tax_liability.cess]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // 2. Outward Supplies Sheet
    const outwardData = [
      ["Table 3.1: Outward Supplies", "", "", "", ""],
      ["Rate", "Taxable Value", "IGST", "CGST", "SGST"],
      ...Object.keys(returnResult.table_3_1_outward_taxable_supplies)
        .filter(k => k !== 'total' && returnResult.table_3_1_outward_taxable_supplies[k].taxable_value > 0)
        .map(k => [
          k.replace('rate_', '') + "%",
          returnResult.table_3_1_outward_taxable_supplies[k].taxable_value,
          returnResult.table_3_1_outward_taxable_supplies[k].igst,
          returnResult.table_3_1_outward_taxable_supplies[k].cgst,
          returnResult.table_3_1_outward_taxable_supplies[k].sgst
        ]),
      ["Total", 
        returnResult.table_3_1_outward_taxable_supplies.total.taxable_value,
        returnResult.table_3_1_outward_taxable_supplies.total.igst,
        returnResult.table_3_1_outward_taxable_supplies.total.cgst,
        returnResult.table_3_1_outward_taxable_supplies.total.sgst
      ]
    ];
    const wsOutward = XLSX.utils.aoa_to_sheet(outwardData);
    XLSX.utils.book_append_sheet(wb, wsOutward, "Outward Supplies");

    // 3. Verification Trail Sheet
    const trailData = [
      ["Invoice No", "Party Name", "GSTIN", "Taxable Value", "Tax Type", "Rate", "Tax Amount", "Category"],
      ...returnResult.verification_trail.map(t => [
        t.invoice_no,
        t.party_name,
        t.gstin,
        t.taxable_value,
        t.tax_type,
        t.tax_rate,
        t.tax_amount,
        t.category
      ])
    ];
    const wsTrail = XLSX.utils.aoa_to_sheet(trailData);
    XLSX.utils.book_append_sheet(wb, wsTrail, "Audit Trail");

    XLSX.writeFile(wb, `GSTR3B_${returnResult.legal_name.replace(/\s+/g, '_')}_${returnResult.return_period}.xlsx`);
  };

  const simulateGeneration = () => {

    if (!selectedClient) {
      alert("Please select a client first.");
      return;
    }
    setLoading(true);
    
    // Dummy transaction data for simulation
    const dummyTransactions = [
      { type: 'Sales', invoice_no: 'INV/001', party_name: 'Alpha Traders', gstin: '27AAAAA0000A1Z1', taxable_value: 100000, rate: 18, hsn: '9954', description: 'Consulting', quantity: 1, uqc: 'NOS' },
      { type: 'Sales', invoice_no: 'INV/002', party_name: 'Beta Corp', gstin: '29BBBBB0000B1Z2', taxable_value: 50000, rate: 12, hsn: '7308', description: 'Materials', quantity: 500, uqc: 'KGS' },
      { type: 'Purchase', invoice_no: 'PUR/101', party_name: 'Supplier X', gstin: '27CCCCC0000C1Z3', taxable_value: 40000, rate: 18, igst: 0, cgst: 3600, sgst: 3600 },
      { type: 'Purchase', invoice_no: 'PUR/102', party_name: 'Supplier Y', gstin: '29DDDDD0000D1Z4', taxable_value: 20000, rate: 12, igst: 2400, cgst: 0, sgst: 0 }
    ];

    setTimeout(() => {
      const result = computeGSTR3B(dummyTransactions, selectedClient);
      setReturnResult(result);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">GSTR-3B Generator</h2>
          <p className="text-muted-foreground">Automated tax computation from accounting exports.</p>
        </div>
        <div className="flex gap-4">
          <select 
            className="p-2 border border-border rounded-xl bg-card text-sm outline-none"
            onChange={(e) => setSelectedClient(clients.find(c => c.client_id === e.target.value))}
          >
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c.client_id} value={c.client_id}>{c.client_name}</option>
            ))}
          </select>
          <button 
            onClick={simulateGeneration}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'Compute GSTR-3B'}
          </button>
        </div>
      </div>

      {!returnResult ? (
        <div className="h-64 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
          <UploadIcon />
          <p className="mt-4 font-medium">Select a client and click "Compute" to simulate return generation.</p>
          <p className="text-xs">Or drag and drop a Tally/Excel export file here.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card border border-border rounded-2xl">
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="font-bold">{returnResult.return_period}</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-2xl">
              <p className="text-xs text-muted-foreground">GSTIN</p>
              <p className="font-bold">{returnResult.gstin}</p>
            </div>
            <div className="p-4 bg-card border border-border rounded-2xl">
              <p className="text-xs text-muted-foreground">Frequency</p>
              <p className="font-bold">{returnResult.filing_frequency}</p>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <p className="text-xs text-primary font-bold">Status</p>
              <p className="font-bold text-primary">Ready to File</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table 3.1 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-bold">Table 3.1: Tax on Outward Supplies</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/10 border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Rate</th>
                      <th className="px-4 py-2">Taxable Value</th>
                      <th className="px-4 py-2">IGST</th>
                      <th className="px-4 py-2">CGST</th>
                      <th className="px-4 py-2">SGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {['rate_5', 'rate_12', 'rate_18', 'rate_28'].map(r => {
                      const data = returnResult.table_3_1_outward_taxable_supplies[r];
                      if (data.taxable_value === 0) return null;
                      return (
                        <tr key={r}>
                          <td className="px-4 py-3 font-bold text-primary">{r.split('_')[1]}%</td>
                          <td className="px-4 py-3">₹{data.taxable_value.toFixed(2)}</td>
                          <td className="px-4 py-3">₹{data.igst.toFixed(2)}</td>
                          <td className="px-4 py-3">₹{data.cgst.toFixed(2)}</td>
                          <td className="px-4 py-3">₹{data.sgst.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-primary/5 font-bold">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3">₹{returnResult.table_3_1_outward_taxable_supplies.total.taxable_value.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_3_1_outward_taxable_supplies.total.igst.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_3_1_outward_taxable_supplies.total.cgst.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_3_1_outward_taxable_supplies.total.sgst.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 4 ITC */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-bold">Table 4: ITC Available</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/10 border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">IGST</th>
                      <th className="px-4 py-2">CGST</th>
                      <th className="px-4 py-2">SGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3">All other ITC</td>
                      <td className="px-4 py-3">₹{returnResult.table_4_itc_available.all_other_itc.igst.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_4_itc_available.all_other_itc.cgst.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_4_itc_available.all_other_itc.sgst.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-green-500/5 font-bold">
                      <td className="px-4 py-3">Net ITC</td>
                      <td className="px-4 py-3">₹{returnResult.table_4_itc_available.total_itc_available.igst.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_4_itc_available.total_itc_available.cgst.toFixed(2)}</td>
                      <td className="px-4 py-3">₹{returnResult.table_4_itc_available.total_itc_available.sgst.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary & Net Liability */}
            <div className="space-y-6">
              <div className="p-6 bg-primary text-primary-foreground rounded-3xl shadow-xl shadow-primary/20 space-y-4">
                <h3 className="text-lg font-bold">Net Tax Payable</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="opacity-80">IGST</span>
                    <span className="font-mono font-bold text-xl">₹{returnResult.net_tax_liability.igst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="opacity-80">CGST</span>
                    <span className="font-mono font-bold text-xl">₹{returnResult.net_tax_liability.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="opacity-80">SGST</span>
                    <span className="font-mono font-bold text-xl">₹{returnResult.net_tax_liability.sgst.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={exportToExcel}
                  className="w-full py-3 bg-white text-primary rounded-xl font-bold hover:bg-opacity-90 transition-all mt-4"
                >
                  Export Excel for Audit Trail
                </button>

              </div>

              <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
                <h3 className="font-bold">Computation Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoices Processed</span>
                    <span className="font-bold">{returnResult.computation_summary.total_invoices_processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">B2B Sales</span>
                    <span className="font-bold">{returnResult.computation_summary.b2b_invoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interstate Sales</span>
                    <span className="font-bold">{returnResult.computation_summary.interstate_sales}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-50"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
