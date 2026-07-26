import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/format";
import { FileText, Plus, Trash2, Download, Printer } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

type LineItem = { id: string; description: string; quantity: number; price: number };

const COLORS = [
  { name: "Default (Slate)", hex: "#0f172a" },
  { name: "Capient Green", hex: "#3DDC97" },
  { name: "Ocean Blue", hex: "#0ea5e9" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Amethyst", hex: "#8b5cf6" },
];

export function InvoicePdfGenerator({ invoice, clientName, currency }: { invoice: any; clientName: string; currency: string }) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Your Company Name");
  const [companyDetails, setCompanyDetails] = useState("123 Business Rd.\nCity, State, 12345");
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState(COLORS[0].hex);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "Professional Services", quantity: 1, price: invoice.amount || 0 }
  ]);

  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGenerating(true);
      
      // html-to-image uses browser native SVG foreignObject drawing - 100% crash proof with oklch / Tailwind v4
      const dataUrl = await toPng(printRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoice_number || 'Invoice'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation encountered an error. Please try the Print / Save PDF option.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.outerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Questrial&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; background: white; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-[#1A1A1A] hover:bg-[#222]">
          <FileText className="h-4 w-4" /> PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1400px] bg-[#0B0D0C] border-white/10 text-white max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b border-white/10 shrink-0">
          <DialogTitle className="font-sans">Generate Invoice PDF</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-full">
          {/* Controls Editor */}
          <div className="w-full lg:w-[420px] shrink-0 p-6 overflow-y-auto custom-scrollbar border-r border-white/10 space-y-6 bg-[#0f1110]">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">Branding</h3>
              <div>
                <label className="text-xs text-muted-foreground">Accent Color</label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setAccentColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 ${accentColor === c.hex ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={accentColor} 
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Logo Image URL</label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="bg-[#111312] border-white/10 mt-1 h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Company Name</label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bg-[#111312] border-white/10 mt-1 h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Company Details</label>
                <textarea 
                  value={companyDetails} 
                  onChange={(e) => setCompanyDetails(e.target.value)} 
                  className="w-full bg-[#111312] border border-white/10 rounded-md p-2 text-sm min-h-[80px] mt-1 resize-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Line Items</h3>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300" onClick={() => setItems([...items, { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 }])}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[#181a19] p-2 rounded-md border border-white/5">
                    <Input 
                      placeholder="Description" 
                      className="col-span-12 bg-[#111312] border-white/10 h-8 text-xs mb-1" 
                      value={item.description} 
                      onChange={(e) => { const n = [...items]; n[idx].description = e.target.value; setItems(n); }} 
                    />
                    <div className="col-span-5 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground uppercase">Qty</span>
                      <Input 
                        type="number" 
                        className="bg-[#111312] border-white/10 h-7 text-xs px-2" 
                        value={item.quantity} 
                        onChange={(e) => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n); }} 
                      />
                    </div>
                    <div className="col-span-5 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground uppercase">Price</span>
                      <Input 
                        type="number" 
                        className="bg-[#111312] border-white/10 h-7 text-xs px-2" 
                        value={item.price} 
                        onChange={(e) => { const n = [...items]; n[idx].price = Number(e.target.value); setItems(n); }} 
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="col-span-2 h-7 w-full text-rose-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                onClick={handleDownloadPdf} 
                disabled={isGenerating} 
                className="w-full bg-[#3DDC97] text-black hover:bg-[#3DDC97]/90 font-bold gap-2 py-6 text-sm shadow-[0_0_20px_rgba(61,220,151,0.3)] cursor-pointer"
              >
                <Download className="h-5 w-5" /> {isGenerating ? "Generating PDF..." : "Download PDF"}
              </Button>
              <Button 
                onClick={handlePrint} 
                variant="outline" 
                className="w-full bg-transparent border-white/20 hover:bg-white/5 text-white gap-2 h-11 text-xs"
              >
                <Printer className="h-4 w-4" /> Print / Save as PDF (Native)
              </Button>
            </div>
          </div>

          {/* Real-time Document Preview Container */}
          <div className="flex-1 bg-[#232725] relative p-4 lg:p-8 flex items-start justify-center h-full overflow-y-auto custom-scrollbar">
            {/* The A4 Sheet */}
            <div 
              ref={printRef}
              style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundColor: '#ffffff',
                color: '#111827',
                fontFamily: "'Manrope', sans-serif",
                position: 'relative',
                boxSizing: 'border-box',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              className="shrink-0"
            >
              {/* Top Banner */}
              <div style={{ height: '16px', width: '100%', backgroundColor: accentColor }}></div>

              <div style={{ padding: '48px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                  <div style={{ maxWidth: '55%' }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" style={{ height: '50px', maxWidth: '200px', objectFit: 'contain', marginBottom: '12px' }} />
                    ) : (
                      <h1 style={{ fontFamily: "'Questrial', sans-serif", fontSize: '32px', fontWeight: 'bold', color: accentColor, margin: '0 0 6px 0' }}>
                        {companyName}
                      </h1>
                    )}
                    <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.6', whitespace: 'pre-line' }}>
                      {companyDetails}
                    </div>
                  </div>

                  <div style={{ width: '40%', textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Questrial', sans-serif", fontSize: '42px', color: '#111827', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>
                      INVOICE
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${accentColor}`, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
                        <span style={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Invoice No</span>
                        <span style={{ color: '#111827', fontWeight: 700 }}>{invoice.invoice_number}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
                        <span style={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Date</span>
                        <span style={{ color: '#111827', fontWeight: 700 }}>{invoice.issue_date}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Due Date</span>
                        <span style={{ color: '#111827', fontWeight: 700 }}>{invoice.due_date || 'On Receipt'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '6px' }}>
                    Billed To
                  </div>
                  <div style={{ fontSize: '20px', color: '#111827', fontWeight: 800 }}>
                    {clientName || 'Walk-in Client'}
                  </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '48px' }}>
                  <thead>
                    <tr>
                      <th style={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accentColor}`, textAlign: 'left', width: '50%' }}>
                        Description
                      </th>
                      <th style={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accentColor}`, textAlign: 'center' }}>
                        Qty
                      </th>
                      <th style={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accentColor}`, textAlign: 'right' }}>
                        Price
                      </th>
                      <th style={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${accentColor}`, textAlign: 'right' }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '14px 8px', fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{item.description || 'Item Description'}</td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', color: '#6b7280', textAlign: 'right' }}>{formatMoney(item.price, currency)}</td>
                        <td style={{ padding: '14px 8px', fontSize: '13px', fontWeight: 700, color: '#111827', textAlign: 'right' }}>{formatMoney(item.quantity * item.price, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '40%', paddingTop: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>
                      Notes
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.5', fontStyle: 'italic' }}>
                      Thank you for your business. Please process this invoice within the due date.
                    </div>
                  </div>

                  <div style={{ width: '320px', backgroundColor: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px', fontSize: '12px' }}>
                      <span style={{ color: '#6b7280', fontWeight: 700 }}>Subtotal</span>
                      <span style={{ color: '#374151', fontWeight: 700 }}>{formatMoney(total, currency)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap' }}>
                      <span style={{ fontSize: '13px', color: '#111827', textTransform: 'uppercase', fontWeight: 800, whiteSpace: 'nowrap', marginRight: '12px' }}>
                        TOTAL DUE
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: accentColor, whiteSpace: 'nowrap' }}>
                        {formatMoney(total, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Watermark Footer - Powered by [Logo] */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 0',
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}>
                <span>Powered by</span>
                <img 
                  src="/full-logo-1.png" 
                  alt="Capient" 
                  style={{ height: '16px', objectFit: 'contain', filter: 'brightness(0)' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
