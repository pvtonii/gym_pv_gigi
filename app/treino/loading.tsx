export default function Loading() {
  return (
    <div className="px-4 py-4 space-y-4" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom) + 20px)' }}>
      {/* Topbar skeleton */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          height: 'calc(56px + env(safe-area-inset-top))',
          paddingTop: 'env(safe-area-inset-top)',
          marginLeft: -16,
          marginRight: -16,
          marginTop: -16,
        }}
      >
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--card-alt)' }} />
          <div className="h-3 w-36 rounded animate-pulse" style={{ background: 'var(--card-alt)' }} />
        </div>
        <div className="h-7 w-10 rounded-full animate-pulse" style={{ background: 'var(--card-alt)' }} />
      </div>

      {/* Day title skeleton */}
      <div className="pt-1 pb-1 space-y-2">
        <div className="h-7 w-32 rounded animate-pulse" style={{ background: 'var(--card-alt)' }} />
        <div className="h-3 w-48 rounded animate-pulse" style={{ background: 'var(--card-alt)' }} />
      </div>

      {/* Phrase skeleton */}
      <div className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--card-alt)' }} />

      {/* Card skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 space-y-3 animate-pulse"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="h-4 w-40 rounded" style={{ background: 'var(--card-alt)' }} />
              <div className="h-3 w-24 rounded" style={{ background: 'var(--card-alt)' }} />
            </div>
            <div className="h-7 w-14 rounded-lg" style={{ background: 'var(--card-alt)' }} />
          </div>
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-11 rounded-xl" style={{ background: 'var(--card-alt)' }} />
            <div className="h-11 rounded-xl" style={{ background: 'var(--card-alt)' }} />
          </div>
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <div className="h-4 w-28 rounded" style={{ background: 'var(--card-alt)' }} />
        </div>
      ))}
    </div>
  )
}
