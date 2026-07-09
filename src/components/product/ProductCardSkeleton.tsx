export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-7 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
