import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/helpers';
import jsPDF from 'jspdf';

export default function VehicleListExport({ vehicles }) {
  const { t, locale } = useI18n();

  const exportPDF = async () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
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
      // fallback to helvetica
    }

    // ── Title ──
    doc.setFontSize(20);
    doc.setFont(boldFont, 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(t('vehicles'), 15, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont(fontName, 'normal');
    doc.setTextColor(120);
    doc.text(`${vehicles.length} ${t('vehicles').toLowerCase()} · ${new Date().toLocaleDateString(locale)}`, 15, y);
    y += 8;

    // ── Table header ──
    const cols = [
      { label: t('make'), x: 15, w: 40 },
      { label: t('model'), x: 55, w: 45 },
      { label: t('registration_number'), x: 100, w: 45 },
      { label: t('registration_date_label') || t('registration_date'), x: 145, w: 50 },
    ];

    doc.setFillColor(30, 41, 59);
    doc.rect(15, y, pageW - 30, 8, 'F');
    doc.setFontSize(9);
    doc.setFont(boldFont, 'bold');
    doc.setTextColor(255);
    cols.forEach(c => doc.text(c.label, c.x + 2, y + 5.5));
    y += 8;

    // ── Rows ──
    doc.setFont(fontName, 'normal');
    doc.setFontSize(9);
    vehicles.forEach((v, idx) => {
      if (y > pageH - 15) { doc.addPage(); y = 15; }
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, pageW - 30, 7, 'F');
      }
      doc.setTextColor(50);
      doc.text(v.make || '-', cols[0].x + 2, y + 5);
      doc.text(v.model || '-', cols[1].x + 2, y + 5);
      doc.text(v.registration_number || '-', cols[2].x + 2, y + 5);
      doc.text(v.registration_date ? formatDate(v.registration_date, locale) : '-', cols[3].x + 2, y + 5);
      y += 7;
    });

    // ── Footer line ──
    doc.setDrawColor(210);
    doc.setLineWidth(0.3);
    doc.line(15, y + 2, pageW - 15, y + 2);

    doc.save(`vehicles_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5 shrink-0">
      <Download className="w-4 h-4" />
      {t('download_pdf')}
    </Button>
  );
}