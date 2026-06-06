"use client";

import { CreditCard, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatCardBrand,
  formatExpiry,
  formatMaskedLast4,
} from "@/lib/format-card";
import type { PaymentMethod } from "@/lib/types/payment-method";
import { cn } from "@/lib/utils";

type SavedCardProps = {
  card: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function SavedCard({
  card,
  isSelected,
  onSelect,
  onDelete,
}: SavedCardProps) {
  function handleDelete() {
    const confirmed = window.confirm(
      `Remove ${formatCardBrand(card.brand)} ending in ${card.last4}?`
    );
    if (confirmed) {
      onDelete();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-colors",
        isSelected
          ? "border-foreground ring-1 ring-foreground"
          : "border-border hover:border-foreground/40"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <CreditCard className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {formatCardBrand(card.brand)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatMaskedLast4(card.last4)}
          </p>
          <p className="text-xs text-muted-foreground">
            Expires {formatExpiry(card.expMonth, card.expYear)}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(event) => {
          event.stopPropagation();
          handleDelete();
        }}
        aria-label={`Delete ${formatCardBrand(card.brand)} card`}
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
