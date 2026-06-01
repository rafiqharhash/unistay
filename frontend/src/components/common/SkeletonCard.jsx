const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="shimmer h-52 w-full" />
    <div className="p-5 space-y-3">
      <div className="shimmer h-5 rounded-lg w-3/4" />
      <div className="shimmer h-4 rounded-lg w-1/2" />
      <div className="flex gap-2">
        <div className="shimmer h-6 rounded-full w-20" />
        <div className="shimmer h-6 rounded-full w-20" />
      </div>
      <div className="shimmer h-4 rounded-lg w-full" />
      <div className="shimmer h-4 rounded-lg w-5/6" />
      <div className="flex justify-between items-center pt-2">
        <div className="shimmer h-7 rounded-lg w-24" />
        <div className="shimmer h-9 rounded-xl w-28" />
      </div>
    </div>
  </div>
);

export const SkeletonDistrictCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="shimmer h-48 w-full" />
    <div className="p-4 space-y-2">
      <div className="shimmer h-5 rounded-lg w-2/3" />
      <div className="shimmer h-4 rounded-lg w-1/3" />
    </div>
  </div>
);

export default SkeletonCard;
