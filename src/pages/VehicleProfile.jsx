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

export default function VehicleProfile() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const pdfRef = useRef(null);

  const { data: vehicle } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list(), select: (v) => v.find(x => x.id === id) });
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: () => base44.entities.ServiceRecord.list('-date', 200), select: (s) => s.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: tires = [] } = useQuery({ queryKey: ['tires'], queryFn: () => base44.entities.TireRecord.list('-installation_date'), select: (t) => t.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: kteos = [] } = useQuery({ queryKey: ['kteos'], queryFn: () => base44.entities.KteoRecord.list('-inspection_date'), select: (k) => k.filter(x => x.vehicle_id === id).slice(0, 30) });
  const { data: insurances = [] } = useQuery({ queryKey: ['insurances'], queryFn: () => base44.entities.InsurancePolicy.list('-expiration_date'), select: (i) => i.filter(x => x.vehicle_id === id).slice(0, 30) });

  if (!vehicle) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  const hasPurchaseInfo = vehicle.seller_name || vehicle.purchase_method || vehicle.purchase_price != null;

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${vehicle.make} ${vehicle.model}`, 15, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (vehicle.registration_number) {
      doc.text(`${t('registration_number')}: ${vehicle.registration_number}`, 15, y);
      y += 6;
    }
    doc.text(`${t('current_mileage')}: ${vehicle.current_mileage?.toLocaleString() || '—'} km`, 15, y);
    y += 10;

    const addSection = (title, rows) => {
      if (y > 260) { doc.addPage(); y = 15; }
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      if (rows.length === 0) {
        doc.text(t('no_data'), 15, y);
        y += 6;
      } else {
        rows.forEach(r => {
          if (y > 270) { doc.addPage(); y = 15; }
          doc.text(r, 15, y);
          y += 5;
        });
      }
      y += 6;
    };

    addSection(t('service_history'), services.map(s => `${formatDate(s.date, locale)} — ${t(s.service_type)}${s.service_center ? ' @ ' + s.service_center : ''}${s.cost ? ' | ' + formatCurrency(s.cost, locale) : ''}${s.mileage ? ' | ' + s.mileage.toLocaleString() + ' km' : ''}`));
    addSection(t('tires'), tires.map(t => `${formatDate(t.installation_date, locale)} — ${t.brand || ''} ${t.model || ''} ${t.size || ''} · ${t(t.action_type)}${t.cost ? ' | ' + formatCurrency(t.cost, locale) : ''}`));
    addSection(t('kteo'), kteos.map(k => `${formatDate(k.inspection_date, locale)} → ${formatDate(k.expiration_date, locale)} — ${t(k.result)}${k.cost ? ' | ' + formatCurrency(k.cost, locale) : ''}`));
    addSection(t('insurance'), insurances.map(i => `${i.company} — ${t(i.coverage_type)} | ${formatDate(i.start_date, locale)} → ${formatDate(i.expiration_date, locale)}${i.cost ? ' | ' + formatCurrency(i.cost, locale) : ''}`));

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
      </div>
    </div>
  );
}