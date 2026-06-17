import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Image, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function ExpenseReceiptUploader({ urls = [], onChange }) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [localUrls, setLocalUrls] = useState(Array.isArray(urls) ? urls : urls ? [urls] : []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const newUrls = [...localUrls];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }

    setLocalUrls(newUrls);
    onChange(newUrls);
    setUploading(false);
    e.target.value = '';
  };

  const removeFile = (index) => {
    const updated = localUrls.filter((_, i) => i !== index);
    setLocalUrls(updated);
    onChange(updated);
  };

  const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url) || url.includes('image');

  return (
    <div className="space-y-2">
      <Label>{t('receipt_documents') || 'Receipt / Invoice'}</Label>
      
      <div className="flex flex-wrap gap-2">
        <label>
          <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading}>
            {uploading ? (
              <span className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {t('upload_file')}
          </Button>
        </label>
      </div>

      {localUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {localUrls.map((url, idx) => (
            <div key={idx} className="relative group">
              {isImage(url) ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}