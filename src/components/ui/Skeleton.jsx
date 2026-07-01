import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={twMerge('animate-pulse rounded-md bg-white/[0.06]', className)}
      {...props}
    />
  );
}

export function TurfCardSkeleton() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-3 flex flex-col gap-3">
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

export function HomeSkeleton() {
  return (
    <div className="w-full pb-10 tm-page pt-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 !rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-2" />
            <Skeleton className="w-28 h-4" />
          </div>
        </div>
        <Skeleton className="w-11 h-11 !rounded-2xl" />
      </div>
      <div className="flex gap-2 mb-6">
        <Skeleton className="w-24 h-8 !rounded-full" />
        <Skeleton className="w-28 h-8 !rounded-full" />
        <Skeleton className="w-24 h-8 !rounded-full" />
      </div>
      <Skeleton className="w-full h-56 mb-6 rounded-3xl" />
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-32 h-4" />
        <div className="flex gap-4">
          <Skeleton className="min-w-[240px] h-32 rounded-2xl" />
          <Skeleton className="min-w-[240px] h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
