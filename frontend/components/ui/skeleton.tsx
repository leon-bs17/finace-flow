/**
 * components/ui/skeleton.tsx — Skeleton loaders para estados de carregamento.
 */
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Formato do skeleton: retangular ou circular. */
  shape?: "rect" | "circle";
}

export function Skeleton({ className, shape = "rect", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-elevated",
        shape === "circle" ? "rounded-full" : "rounded-lg",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Skeleton pré-configurado para um StatCard. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8" shape="circle" />
      </div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/** Skeleton pré-configurado para uma linha de transação. */
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="h-9 w-9" shape="circle" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}
