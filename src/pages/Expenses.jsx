import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, formatDate, categoryColors } from '@/lib/helpers';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import VehicleSelector from '@/components/shared/VehicleSelector';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { Receipt, Pencil, Trash2, MoreVertical, Search, X, FileText, Download, Eye, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Expenses() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add');
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [viewDoc, setViewDoc] = useState(null);

  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => base44.entities.Vehicle.list() });
  const { data: expenses = [], isLoading, refetch } = useQuery({ queryKey: ['expenses'], queryFn: () => base44.entities.Expense.list('-date', 200) });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      const previous = queryClient.getQueryData(['expenses']);
      queryClient.setQueryData(['expenses'], old => (old || []).filter(e => e.id !== id));
      setDeleteId(null);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['expenses'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleRefresh = async () => { await refetch(); };

  const vehicleMap = {};
  vehicles.forEach(v => { vehicleMap[v.id] = v; });

  const suppliers = [...new Set(expenses.map(e => e.supplier).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    let result = vehicleFilter === 'all' ? expenses : expenses.filter(e => e.vehicle_id === vehicleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => {
        const vehicle = vehicleMap[e.vehicle_id];
        const vehicleStr = vehicle ? `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.registration_number || ''}`.toLowerCase() : '';
        return (
          vehicleStr.includes(q) ||
          e.supplier?.toLowerCase().includes(q) ||
          e.invoice_number?.toLowerCase().includes(q) ||
          e.receipt_number?.toLowerCase().includes(q) ||
          t(e.category === 'tires' ? 'tires_cat' : e.category === 'insurance' ? 'insurance_cat' : e.category === 'kteo' ? 'kteo_cat' : e.category).toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          String(e.amount).includes(q)
        );
      });
    }
    if (dateFrom) result = result.filter(e => e.date >= dateFrom);
    if (dateTo) result = result.filter(e => e.date <= dateTo);
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'others') {
        const mainCats = ['fuel', 'service', 'tires', 'insurance', 'kteo'];
        result = result.filter(e => !mainCats.includes(e.category));
      } else {
        result = result.filter(e => e.category === categoryFilter);
      }
    }
    if (supplierFilter !== 'all') {
      result = result.filter(e => e.supplier === supplierFilter);
    }
    return result;
  }, [expenses, vehicleFilter, searchQuery, dateFrom, dateTo, categoryFilter, supplierFilter, t]);

  const totalFiltered = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title={t('expenses')} action={() => setShowForm(true)} actionLabel={t('add_expense')} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 flex-wrap">
          <VehicleSelector vehicles={vehicles} value={vehicleFilter} onChange={setVehicleFilter} />
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('search_expenses')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="service">{t('service')}</SelectItem>
                <SelectItem value="tires">{t('tires_cat')}</SelectItem>
                <SelectItem value="insurance">{t('insurance_cat')}</SelectItem>
                <SelectItem value="kteo">{t('kteo_cat')}</SelectItem>
                <SelectItem value="others">{t('others_group')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-40 h-9 text-xs">
                <SelectValue placeholder={t('supplier')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')} {t('supplier')}</SelectItem>
                {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 text-xs" placeholder={t('date_from')} />
            <span className="text-xs text-muted-foreground">—</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 text-xs" placeholder={t('date_to')} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-muted-foreground hover:text-foreground" aria-label="Clear date range">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted-foreground">
            {t('total')}: <span className="font-semibold text-foreground">{formatCurrency(totalFiltered, locale)}</span>
            <span className="ml-2">({filtered.length} records)</span>
          </span>
        </div>

        {filtered.length === 0 && !isLoading ? (
          <EmptyState icon={Receipt} title={t('no_data')} actionLabel={t('add_expense')} action={() => setShowForm(true)} />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('date')}</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('vehicles')}</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('registration_number')}</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('category')}</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{t('supplier')}</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">{t('amount')}</th>
                      <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3 w-12">{t('receipt_documents')}</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(exp => {
                      const vehicle = vehicleMap[exp.vehicle_id];
                      const catKey = exp.category === 'tires' ? 'tires_cat' : exp.category === 'insurance' ? 'insurance_cat' : exp.category === 'kteo' ? 'kteo_cat' : exp.category;
                      const urls = exp.receipt_urls || (exp.receipt_url ? [exp.receipt_url] : []);
                      const hasDocs = urls.length > 0;
                      return (
                        <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(exp.date, locale)}</td>
                          <td className="px-4 py-3 text-sm">{vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || vehicle.name || '—' : '—'}</td>
                          <td className="px-4 py-3 text-sm font-mono font-medium">{vehicle?.registration_number || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className={cn("text-xs", categoryColors[exp.category])}>{t(catKey)}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{exp.supplier || '—'}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold whitespace-nowrap">{formatCurrency(exp.amount, locale)}</td>
                          <td className="px-4 py-3 text-center">
                            {hasDocs ? (
                              <button onClick={() => setViewDoc(urls)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline" aria-label={`View ${urls.length} documents`}>
                                <FileText className="w-3.5 h-3.5" />
                                {urls.length}
                              </button>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for expense`}><MoreVertical className="w-3.5 h-3.5" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditItem(exp); setShowForm(true); }}>
                                  <Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}
                                </DropdownMenuItem>
                                {hasDocs && <DropdownMenuItem onClick={() => setViewDoc(urls)}><Eye className="w-3.5 h-3.5 mr-2" />{t('view_documents')}</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => setDeleteId(exp.id)} className="text-destructive">
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {filtered.map(exp => {
                const vehicle = vehicleMap[exp.vehicle_id];
                const catKey = exp.category === 'tires' ? 'tires_cat' : exp.category === 'insurance' ? 'insurance_cat' : exp.category === 'kteo' ? 'kteo_cat' : exp.category;
                const urls = exp.receipt_urls || (exp.receipt_url ? [exp.receipt_url] : []);
                const hasDocs = urls.length > 0;
                return (
                  <div key={exp.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 active:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || vehicle.name || '—' : '—'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", categoryColors[exp.category])}>{t(catKey)}</Badge>
                            {vehicle?.registration_number && <span className="text-xs font-mono font-semibold">{vehicle.registration_number}</span>}
                          </div>
                        </div>
                        <span className="text-sm font-semibold whitespace-nowrap">{formatCurrency(exp.amount, locale)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{formatDate(exp.date, locale)}</span>
                        <div className="flex items-center gap-2">
                          {hasDocs && (
                            <button onClick={() => setViewDoc(urls)} className="text-[10px] text-primary font-medium" aria-label={`View ${urls.length} documents`}>
                              {urls.length} {t('receipt_documents')}
                            </button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for expense`}><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditItem(exp); setShowForm(true); }}>
                                <Pencil className="w-3.5 h-3.5 mr-2" />{t('edit')}
                              </DropdownMenuItem>
                              {hasDocs && <DropdownMenuItem onClick={() => setViewDoc(urls)}><Eye className="w-3.5 h-3.5 mr-2" />{t('view_documents')}</DropdownMenuItem>}
                              <DropdownMenuItem onClick={() => setDeleteId(exp.id)} className="text-destructive">
                                <Trash2 className="w-3.5 h-3.5 mr-2" />{t('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewDoc && (
          <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader><DialogTitle>{t('receipt_documents')}</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {(viewDoc || []).map((url, idx) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                  return (
                    <div key={idx} className="border border-border rounded-lg overflow-hidden">
                      {isImage ? (
                        <img src={url} alt="" className="w-full max-h-80 object-contain bg-muted" />
                      ) : (
                        <div className="p-8 flex flex-col items-center gap-3 bg-muted">
                          <FileText className="w-10 h-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{t('pdf_document')}</p>
                        </div>
                      )}
                      <div className="p-2 bg-muted/50 flex justify-end gap-2">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="gap-1.5"><Eye className="w-3.5 h-3.5" />{t('open')}</Button>
                        </a>
                        <a href={url} download>
                          <Button variant="ghost" size="sm" className="gap-1.5"><Download className="w-3.5 h-3.5" />{t('download')}</Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showForm && (
          <ExpenseForm
            open={showForm}
            onClose={() => { setShowForm(false); setEditItem(null); }}
            expense={editItem}
            vehicles={vehicles}
          />
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PullToRefresh>
  );
}