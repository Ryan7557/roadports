import React from 'react';

export function PotholeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
      <div className="h-48 w-full shimmer" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 rounded w-24 shimmer" />
          <div className="h-6 rounded-full w-20 shimmer" />
        </div>
        <div className="flex justify-between items-center mb-1">
          <div className="h-6 rounded w-2/3 shimmer" />
          <div className="h-7 rounded w-20 shimmer" />
        </div>
        <div className="h-4 rounded w-1/2 mb-4 mt-2 shimmer" />
        <div className="mt-auto flex justify-between items-center bg-gray-50 -mx-5 -mb-5 px-5 py-3 border-t border-gray-100">
          <div className="h-4 rounded w-1/3 shimmer" />
          <div className="h-4 rounded w-1/4 shimmer" />
        </div>
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full bg-white p-2 rounded-2xl shadow-xl border border-gray-200 mb-8 flex flex-col relative z-0 min-h-[300px]">
      <div className="w-full h-[46px] rounded-t-xl mb-2 shimmer" />
      <div className="w-full h-[350px] rounded-b-xl overflow-hidden bg-gray-100 flex items-center justify-center relative">
        <div className="absolute inset-0 shimmer opacity-50" />
        <div className="w-12 h-12 rounded-full shimmer shadow-lg relative z-10" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
          <div className="h-3 rounded w-1/2 shimmer" />
          <div className="h-8 rounded w-1/3 shimmer" />
        </div>
      ))}
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="w-full max-w-5xl p-4 md:p-6 mt-4 md:mt-8 flex flex-col items-center">
      {/* Progress Bar Skeleton */}
      <div className="w-full max-w-sm flex items-center justify-between mb-8 opacity-50">
        {[...Array(3)].map((_, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full shimmer" />
              <div className="h-2 w-10 mt-2 rounded shimmer" />
            </div>
            {i < 2 && <div className="flex-1 h-1 mx-2 rounded shimmer" />}
          </React.Fragment>
        ))}
      </div>

      {/* Main Container Skeleton */}
      <div className="w-full rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex items-center justify-center border bg-white border-gray-100 p-12">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="h-10 w-64 rounded-lg shimmer mb-4" />
          <div className="h-4 w-full max-w-md rounded shimmer mb-8" />
          <div className="w-full aspect-video rounded-3xl shimmer border-4 border-dashed border-gray-100" />
        </div>
      </div>
    </div>
  );
}
