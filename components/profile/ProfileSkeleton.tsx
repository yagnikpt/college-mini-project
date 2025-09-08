export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="relative">
        <div className="h-48 bg-muted" />
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
            <div className="w-30 h-30 bg-muted rounded-full border-4 border-background" />
            <div className="flex-1 mt-4 md:mt-0 space-y-3">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-32" />
              <div className="flex gap-6">
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex border-b border-border mb-6">
          <div className="h-12 bg-muted rounded w-24" />
          <div className="h-12 bg-muted rounded w-32 ml-6" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className="flex items-center gap-4 p-4 bg-muted rounded-lg"
            >
              <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
              <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-48" />
                <div className="h-3 bg-muted-foreground/20 rounded w-32" />
              </div>
              <div className="h-4 bg-muted-foreground/20 rounded w-16" />
              <div className="h-4 bg-muted-foreground/20 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
