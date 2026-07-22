"use client";

import { Check, ChevronDown, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InfiniteSelectProps, RelationOption } from "@/types/experience";

export function InfiniteSelect(props: InfiniteSelectProps) {
  const {
    id,
    label,
    placeholder,
    searchPlaceholder = "Search…",
    options,
    search,
    onSearchChange,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    onLoadMore,
    onRetry,
    errorMessage,
    required,
    clearable,
    disabled,
    multiple = false,
    value,
    onChange,
  } = props;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(search);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValues = useMemo(
    () => new Set((multiple ? (value as RelationOption[]) : value ? [value as RelationOption] : []).map((item) => item.value)),
    [multiple, value],
  );

  const closeDropdown = () => {
    setOpen(false);
    setInputValue("");
    setActiveIndex(0);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => onSearchChange(inputValue), 300);
    return () => window.clearTimeout(timeout);
  }, [inputValue, onSearchChange]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeDropdown();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open || !hasNextPage || isFetchingNextPage || !sentinelRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, open]);

  useEffect(() => {
    if (open) window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const selectOption = (option: RelationOption) => {
    if (multiple) {
      const values = value as RelationOption[];
      const next = selectedValues.has(option.value)
        ? values.filter((item) => item.value !== option.value)
        : [...values, option];
      (onChange as (next: RelationOption[]) => void)(next);
      return;
    }
    (onChange as (next: RelationOption | null) => void)(option);
    closeDropdown();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      closeDropdown();
      return;
    }
    if (!options.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (event.key === "Home") setActiveIndex(0);
      else if (event.key === "End") setActiveIndex(options.length - 1);
      else {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((index) => (index + direction + options.length) % options.length);
      }
    }
    if (event.key === "Enter") {
      event.preventDefault();
      selectOption(options[activeIndex]);
    }
  };

  const selectedSingle = !multiple ? (value as RelationOption | null) : null;

  return (
    <div ref={rootRef} className="relative">
      <label id={`${id}-label`} className="font-mono text-xs uppercase tracking-[0.14em]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {multiple && (value as RelationOption[]).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(value as RelationOption[]).map((option) => (
            <Badge key={option.value} className="gap-1 py-1.5 text-fg">
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                onClick={() =>
                  (onChange as (next: RelationOption[]) => void)(
                    (value as RelationOption[]).filter((item) => item.value !== option.value),
                  )
                }
              >
                <X size={12} aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-labelledby={`${id}-label ${id}`}
        aria-invalid={Boolean(errorMessage)}
        onClick={() => (open ? closeDropdown() : setOpen(true))}
        className={cn(
          "mt-1 flex min-h-12 w-full items-center justify-between border border-border bg-bg px-3 text-left transition-colors focus-visible:border-fg focus-visible:outline-none",
          errorMessage && "border-red-500",
        )}
      >
        <span className={cn("truncate", !selectedSingle && multiple ? "text-muted" : "", !selectedSingle && !multiple && "text-muted")}>
          {selectedSingle?.label ?? (multiple && (value as RelationOption[]).length ? `${(value as RelationOption[]).length} selected` : placeholder)}
        </span>
        <ChevronDown className={cn("shrink-0 transition-transform", open && "rotate-180")} size={16} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full border border-fg bg-bg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search size={15} className="text-muted" aria-hidden="true" />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={`${id}-listbox`}
              aria-activedescendant={options[activeIndex] ? `${id}-option-${options[activeIndex].value}` : undefined}
              className="min-h-11 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
            />
            {inputValue && (
              <Button type="button" size="icon" variant="secondary" className="h-7 min-h-7 w-7 border-0" onClick={() => setInputValue("")} aria-label="Clear search">
                <X size={13} />
              </Button>
            )}
          </div>

          <div id={`${id}-listbox`} role="listbox" aria-multiselectable={multiple || undefined} className="max-h-64 overflow-y-auto py-1">
            {!multiple && clearable && selectedSingle && (
              <button
                type="button"
                onClick={() => {
                  (onChange as (next: RelationOption | null) => void)(null);
                  closeDropdown();
                }}
                className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm text-muted hover:bg-fg hover:text-bg"
              >
                <X size={14} aria-hidden="true" />
                Clear selection
              </button>
            )}
            {isLoading && <p className="flex items-center gap-2 px-3 py-4 text-sm text-muted"><LoaderCircle className="animate-spin" size={15} /> Loading options…</p>}
            {isError && (
              <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm text-red-500">
                <span>Failed to load options.</span>
                <Button type="button" size="sm" variant="secondary" onClick={onRetry}>Retry</Button>
              </div>
            )}
            {!isLoading && !isError && options.length === 0 && <p className="px-3 py-4 text-sm text-muted">No options found.</p>}
            {!isLoading && !isError && options.map((option, index) => {
              const selected = selectedValues.has(option.value);
              return (
                <button
                  key={option.value}
                  id={`${id}-option-${option.value}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm",
                    index === activeIndex && "bg-fg text-bg",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && <Check size={15} aria-hidden="true" />}
                </button>
              );
            })}
            <div ref={sentinelRef} className="h-px" />
            {isFetchingNextPage && <p className="flex items-center gap-2 px-3 py-3 text-xs text-muted"><LoaderCircle className="animate-spin" size={13} /> Loading more…</p>}
          </div>
        </div>
      )}
      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
}
