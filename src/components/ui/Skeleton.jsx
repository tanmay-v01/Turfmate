import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={twMerge('animate-pulse rounded-md bg-slate-200/80', className)}
      {...props}
    />
  );
}

export function TurfCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col gap-3">
      <Skeleton className="w-full h-36 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}
