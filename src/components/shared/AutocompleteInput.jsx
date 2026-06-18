import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AutocompleteInput({ value, onChange, options = [], placeholder = '', required = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(options);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setFiltered(options);
    } else {
      const lower = value.toLowerCase();
      setFiltered(options.filter(o => o.toLowerCase().includes(lower)));
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  const handleFocus = () => {
    setFiltered(value ? options.filter(o => o.toLowerCase().includes(value.toLowerCase())) : options);
    setOpen(true);
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filtered.map((option, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                option === value && 'bg-primary/10 text-primary font-medium'
              )}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(option); }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}