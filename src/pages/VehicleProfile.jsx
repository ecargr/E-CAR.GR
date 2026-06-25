import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate, getDaysUntil, getUrgencyColor } from '@/lib/helpers';
import { ArrowLeft, Car, Bike, Gauge, Wrench, CircleDot, Shield, ClipboardCheck, Download, Calendar, User, Building, Banknote, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import VehicleDocumentSearch from '@/components/vehicles/VehicleDocumentSearch';

export default function VehicleProfile() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const pdfRef = useRef(null);

  const { data: vehicle } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list(), select: (v) => v.find(x => x.id === id) });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.ServiceRecord.list('-date', 200), select: (s) => s.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: tires = [] } = useQuery({ queryKey: ['tires'], queryFn: () => base44.entities.TireRecord.list('-installation_date'), select: (t) => t.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: kteos = [] } = useQuery({ queryKey: ['kteos'], queryFn: () => base44.entities.KteoRecord.list('-inspection_date'), select: (k) => k.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: insurances = [] } = useQuery({ queryKey: ['insurances'], queryFn: () => base44.entities.InsurancePolicy.list('-expiration_date'), select: (i) => i.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: documents = [] } = useQuery({ queryKey: ['documents'], queryFn: () => base44.entities.VehicleDocument.list('-created_date'), select: (d) => d.filter(x => x.vehicle_id === id) });
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list('-date', 200), select: (e) => e.filter(x => x.vehicle_id === id).slice(0, 50) });

  if (!vehicle) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  const hasPurchaseInfo = vehicle.seller_name || vehicle.purchase_method || vehicle.purchase_price != null;

  // Gather all attached files from related records so they appear in the document search
  const allDocuments = [
    ...documents.map(d => ({ id: d.id, title: d.title, category: d.category, file_url: d.file_url, expiry_date: d.expiry_date, notes: d.notes })),
    ...insurances.flatMap(i => [
      ...(i.photos || []).map((url, idx) => ({ id: `ins-${i.id}-${idx}`, title: `${t('insurance')} — ${i.company || ''}`, category: 'insurance', file_url: url, expiry_date: i.expiration_date, notes: i.policy_number })),
      ...(i.document_url ? [{ id: `insdoc-${i.id}`, title: `${t('insurance')} — ${i.company || ''}`, category: 'insurance', file_url: i.document_url, expiry_date: i.expiration_date, notes: i.policy_number }] : []),
    ]),
    ...kteos.flatMap(k => (k.photos || []).map((url, idx) => ({ id: `kteo-${k.id}-${idx}`, title: `${t('kteo')} — ${formatDate(k.inspection_date, locale)}`, category: 'kteo', file_url: url, expiry_date: k.expiration_date, notes: k.notes }))),
    ...tires.flatMap(tr => (tr.photos || []).map((url, idx) => ({ id: `tire-${tr.id}-${idx}`, title: `${t('tires')} — ${tr.brand || ''} ${tr.model || ''}`.trim(), category: 'tires', file_url: url, expiry_date: undefined, notes: tr.notes }))),
    ...services.flatMap(s => [
      ...(s.photos || []).map((url, idx) => ({ id: `svc-${s.id}-${idx}`, title: `${t(s.service_type)} — ${formatDate(s.date, locale)}`, category: 'service_invoice', file_url: url, expiry_date: undefined, notes: s.notes })),
      ...(s.invoice_url ? [{ id: `svcdoc-${s.id}`, title: `${t(s.service_type)} — ${formatDate(s.date, locale)}`, category: 'service_invoice', file_url: s.invoice_url, expiry_date: undefined, notes: s.notes }] : []),
    ]),
    ...expenses.flatMap(e => [
      ...(e.receipt_urls || []).map((url, idx) => ({ id: `exp-${e.id}-${idx}`, title: `${t(e.category)} — ${formatDate(e.date, locale)}`, category: e.category === 'insurance' ? 'insurance' : e.category === 'kteo' ? 'kteo' : e.category === 'tires' ? 'tires' : 'service_invoice', file_url: url, expiry_date: undefined, notes: e.notes })),
      ...(e.receipt_url ? [{ id: `expdoc-${e.id}`, title: `${t(e.category)} — ${formatDate(e.date, locale)}`, category: e.category === 'insurance' ? 'insurance' : e.category === 'kteo' ? 'kteo' : e.category === 'tires' ? 'tires' : 'service_invoice', file_url: e.receipt_url, expiry_date: undefined, notes: e.notes }] : []),
    ]),
    ...(vehicle.purchase_documents || []).map((url, idx) => ({ id: `veh-${idx}`, title: t('purchase_documents'), category: 'purchase', file_url: url, expiry_date: undefined, notes: undefined })),
  ].filter(d => d.file_url);

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    // ── Load Greek-compatible font ──
    let fontName = 'helvetica';
    let boldFont = 'helvetica';
    try {
      const loadFont = async (url, name, style) => {
        const resp = await fetch(url);
        const buffer = await resp.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        doc.addFileToVFS(name + '.ttf', base64);
        doc.addFont(name + '.ttf', name, style);
        return name;
      };
      boldFont = await loadFont('https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Bold.ttf', 'RobotoBold', 'bold');
      fontName = await loadFont('https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf', 'Roboto', 'normal');
    } catch (e) {
      // fallback to helvetica (no Greek support but won't crash)
    }

    // ── Title ──
    doc.setFontSize(20);
    doc.setFont(boldFont, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${t('vehicle_details')}`, 15, y);
    y += 16;

    // ── Vehicle Info Block ──
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    const infoBlockH = 50;
    doc.rect(15, y, pageW - 30, infoBlockH);
    y += 5;

    doc.setFontSize(16);
    doc.setFont(boldFont, 'bold');
    doc.text(`${vehicle.make} ${vehicle.model}${vehicle.version ? ' · ' + vehicle.version : ''}`, 20, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont(fontName, 'normal');
    doc.setTextColor(80);

    if (vehicle.registration_number) {
      doc.text(`${t('registration_number')}: ${vehicle.registration_number}`, 20, y);
    }
    if (vehicle.vin) {
      doc.text(`${t('vin_number')}: ${vehicle.vin}`, pageW - 80, y);
    }
    y += 5;

    const specs = [];
    if (vehicle.current_mileage != null) specs.push(`${t('current_mileage')}: ${vehicle.current_mileage.toLocaleString()} km`);
    if (vehicle.registration_date) specs.push(`${t('registration_date_label')}: ${formatDate(vehicle.registration_date, locale)}`);
    if (vehicle.fuel_type) specs.push(`${t('fuel_type')}: ${t(vehicle.fuel_type)}`);
    if (vehicle.transmission) specs.push(`${t('transmission')}: ${t(vehicle.transmission)}`);
    if (vehicle.engine_capacity) specs.push(`${t('engine_capacity')}: ${vehicle.engine_capacity} cc`);
    if (vehicle.horsepower) specs.push(`${t('horsepower')}: ${vehicle.horsepower} hp`);
    if (vehicle.color) specs.push(`${t('color')}: ${vehicle.color}`);

    specs.forEach((s, i) => {
      const col = i % 2 === 0 ? 20 : pageW / 2 + 10;
      const row = Math.floor(i / 2);
      doc.text(s, col, y + row * 5);
    });
    y += Math.ceil(specs.length / 2) * 5 + 10;

    // ── Section helper: draws a professional separator bar, title, underline, then rows ──
    const addSection = (title, rows) => {
      if (y > 220) { doc.addPage(); y = 15; }
      // Separator bar
      y += 4;
      doc.setFillColor(240, 242, 245);
      doc.rect(15, y, pageW - 30, 12, 'F');
      y += 2;
      doc.setFontSize(13);
      doc.setFont(boldFont, 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(title, 20, y + 5);
      y += 14;
      // Thin line under title
      doc.setDrawColor(210);
      doc.setLineWidth(0.3);
      doc.line(15, y, pageW - 15, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont(fontName, 'normal');
      doc.setTextColor(60);
      if (rows.length === 0) {
        doc.text(t('no_data'), 18, y);
        y += 6;
      } else {
        rows.forEach((r, idx) => {
          if (y > 272) { doc.addPage(); y = 15; }
          // subtle alternating row background
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(15, y - 2, pageW - 30, 5, 'F');
          }
          doc.text(r, 18, y);
          y += 5;
        });
      }
      y += 10;
    };

    // ── Service History (notes & prices) ──
    addSection(t('service_history'), services.flatMap(s => {
      let line = `${formatDate(s.date, locale)} — ${t(s.service_type)}`;
      if (s.service_center) line += ` @ ${s.service_center}`;
      if (s.mileage) line += ` | ${s.mileage.toLocaleString()} km`;
      if (s.cost) line += ` | ${formatCurrency(s.cost, locale)}`;
      const lines = [line];
      if (s.notes) lines.push(`      ↳ ${s.notes}`);
      return lines;
    }));

    // ── KTEO History (dates, mileage, result) ──
    addSection(t('kteo'), kteos.flatMap(k => {
      let line = `${formatDate(k.inspection_date, locale)} → ${formatDate(k.expiration_date, locale)} — ${t(k.result)}`;
      if (k.mileage) line += ` | ${k.mileage.toLocaleString()} km`;
      const lines = [line];
      if (k.notes) lines.push(`      ↳ ${k.notes}`);
      return lines;
    }));

    // ── Tires (date + km + front/back dates, no expiry) ──
    addSection(t('tires'), tires.flatMap(tr => {
      let line = `${tr.brand || ''} ${tr.model || ''} ${tr.size || ''}`.trim();
      line += ` · ${t(tr.action_type)}`;
      if (tr.installation_date) line += ` · ${formatDate(tr.installation_date, locale)}`;
      if (tr.mileage_at_installation) line += ` | ${tr.mileage_at_installation.toLocaleString()} km`;
      const dateParts = [];
      if (tr.front_tire_date) dateParts.push(`Front: ${tr.front_tire_date}`);
      if (tr.back_tire_date) dateParts.push(`Back: ${tr.back_tire_date}`);
      if (dateParts.length > 0) line += ` | ${dateParts.join(', ')}`;
      const lines = [line];
      if (tr.notes) lines.push(`      ↳ ${tr.notes}`);
      return lines;
    }));

    doc.save(`${vehicle.make}_${vehicle.model}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const HistorySection = ({ icon: Icon, iconColor, title, items, renderItem }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <h3 className="font-heading font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{items.length}</span>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4">{t('no_data')}</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <span className="flex-1 min-w-0 truncate">{renderItem(item)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto" ref={pdfRef}>
      <div className="flex items-center justify-between mb-6 gap-3">
        <Link to="/vehicles">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            {t('vehicles')}
          </Button>
        </Link>
        <Button size="sm" variant="outline" onClick={exportPDF} className="gap-1.5">
          <Download className="w-4 h-4" />
          {t('download_pdf')}
        </Button>
      </div>

      {/* Vehicle Header */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {vehicle.photos?.[0] ? (
              <img src={vehicle.photos[0]} alt="" className="w-full h-full object-cover" />
            ) : vehicle.type === 'motorcycle' ? (
              <Bike className="w-8 h-8 text-primary/30" />
            ) : (
              <Car className="w-8 h-8 text-primary/30" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-heading font-bold">{vehicle.make} {vehicle.model}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {vehicle.registration_number && (
                <span className="bg-primary text-primary-foreground text-sm font-mono font-bold px-2.5 py-0.5 rounded-md tracking-wide">{vehicle.registration_number}</span>
              )}
              {vehicle.transmission && <Badge variant="secondary" className="text-xs">{t(vehicle.transmission)}</Badge>}
              {vehicle.fuel_type && <Badge variant="secondary" className="text-xs">{t(vehicle.fuel_type)}</Badge>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
          {vehicle.current_mileage != null && (
            <div className="flex items-center gap-1.5 text-sm"><Gauge className="w-4 h-4 text-muted-foreground" /><span className="font-semibold">{vehicle.current_mileage.toLocaleString()} km</span></div>
          )}
          {vehicle.registration_date && (
            <div className="flex items-center gap-1.5 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{formatDate(vehicle.registration_date, locale)}</span></div>
          )}
          {vehicle.engine_capacity && (
            <div className="text-sm"><span className="text-muted-foreground">{vehicle.engine_capacity} cc</span></div>
          )}
          {vehicle.horsepower && (
            <div className="text-sm"><span className="text-muted-foreground">{vehicle.horsepower} hp</span></div>
          )}
        </div>
        {hasPurchaseInfo && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border flex-wrap">
            {vehicle.seller_name && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><User className="w-3 h-3" /> {vehicle.seller_name}</span>
            )}
            {vehicle.purchase_price != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><Banknote className="w-3 h-3" /> {formatCurrency(vehicle.purchase_price, locale)}</span>
            )}
            {(vehicle.purchase_documents || []).length > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600"><FileText className="w-3 h-3" /> {vehicle.purchase_documents.length} {t('purchase_documents')}</span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <HistorySection
          icon={Wrench} iconColor="text-emerald-600"
          title={t('service_history')}
          items={services}
          renderItem={s => (
            <span>
              <span className="font-medium">{t(s.service_type)}</span>
              <span className="text-muted-foreground"> · {formatDate(s.date, locale)}</span>
              {s.service_center && <span className="text-muted-foreground"> · {s.service_center}</span>}
              {s.cost && <span className="font-semibold ml-2">{formatCurrency(s.cost, locale)}</span>}
              {s.mileage && <span className="text-muted-foreground ml-1">{s.mileage.toLocaleString()} km</span>}
            </span>
          )}
        />
        <HistorySection
          icon={CircleDot} iconColor="text-slate-600"
          title={t('tires')}
          items={tires}
          renderItem={tire => (
            <span>
              <span className="font-medium">{tire.brand || tire.size} {tire.model}</span>
              <span className="text-muted-foreground"> · {t(tire.action_type)} · {formatDate(tire.installation_date, locale)}</span>
              {tire.cost && <span className="font-semibold ml-2">{formatCurrency(tire.cost, locale)}</span>}
            </span>
          )}
        />
        <HistorySection
          icon={ClipboardCheck} iconColor="text-blue-600"
          title={t('kteo')}
          items={kteos}
          renderItem={k => (
            <span>
              <span className="font-medium">{t('kteo')}</span>
              <span className="text-muted-foreground"> · {formatDate(k.inspection_date, locale)} → {formatDate(k.expiration_date, locale)}</span>
              <Badge variant="secondary" className="text-[10px] ml-2">{t(k.result)}</Badge>
              {k.cost && <span className="font-semibold ml-2">{formatCurrency(k.cost, locale)}</span>}
            </span>
          )}
        />
        <HistorySection
          icon={Shield} iconColor="text-violet-600"
          title={t('insurance')}
          items={insurances}
          renderItem={i => {
            const days = getDaysUntil(i.expiration_date);
            return (
              <span>
                <span className="font-medium">{i.company}</span>
                <span className="text-muted-foreground"> · {t(i.coverage_type)} · {formatDate(i.start_date, locale)} → {formatDate(i.expiration_date, locale)}</span>
                <Badge variant="secondary" className={cn("text-[10px] ml-2", getUrgencyColor(days))}>
                  {days < 0 ? t('expired') : `${days}d`}
                </Badge>
                {i.cost && <span className="font-semibold ml-2">{formatCurrency(i.cost, locale)}</span>}
              </span>
            );
          }}
        />
        <VehicleDocumentSearch documents={allDocuments} />
      </div>
    </div>
  );
}