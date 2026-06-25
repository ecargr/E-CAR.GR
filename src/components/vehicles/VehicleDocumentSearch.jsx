import React, { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/helpers';
import { FileText, Search, X, Download, ExternalLink, File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function VehicleDocumentSearch({ documents }) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return documents;
    const q = query.toLowerCase();
    return documents.filter(d => {
      const title = (d.title || '').toLowerCase();
      const category = t(d.category || '').toLowerCase();
      const notes = (d.notes || '').toLowerCase();
      return title.includes(q) || category.includes(q) || notes.includes(q);
    });
  }, [documents, query, locale]);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <FileText className="w-4 h-4 text-violet-600" />
        <h3 className="font-heading font-semibold text-sm">{t('documents')}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{documents.length}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('search_documents') || t('search')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{query ? t('no_data') : t('no_data')}</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <File className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">{t(doc.category)}</Badge>
                    {doc.expiry_date && (
                      <span className="text-xs text-muted-foreground">{formatDate(doc.expiry_date, locale)}</span>
                    )}
                  </div>
                </div>
                {doc.file_url && (
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    <a href={doc.file_url} download>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}