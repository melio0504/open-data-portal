export interface LoadingSkeletonProps {
  variant: "stat-card" | "dataset-card" | "generic" | "resource-row"
  count?: number
}

export const LoadingSkeleton = ({
  variant,
  count = 1,
}: LoadingSkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => `${variant}-${i}`)

  if (variant === "stat-card") {
    return (
      <>
        {skeletons.map((id) => (
          <div
            key={id}
            className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-10 bg-neutral-200 rounded w-24 mb-3"></div>
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
              </div>
              <div className="bg-neutral-200 p-3 rounded-lg w-14 h-14"></div>
            </div>
          </div>
        ))}
      </>
    )
  }

  if (variant === "dataset-card") {
    return (
      <>
        {skeletons.map((id) => (
          <div
            key={id}
            className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 animate-pulse"
          >
            <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-neutral-200 rounded-full w-24"></div>
              <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
            </div>
            <div className="flex justify-between pt-4 border-t border-neutral-100">
              <div className="h-4 bg-neutral-200 rounded w-32"></div>
              <div className="h-4 bg-neutral-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </>
    )
  }

  if (variant === "resource-row") {
    return (
      <>
        {skeletons.map((id) => (
          <tr key={id} className="animate-pulse">
            <td className="px-6 py-4">
              <div className="h-4 bg-neutral-200 rounded w-48"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-neutral-200 rounded w-20"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-neutral-200 rounded w-16"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 bg-neutral-200 rounded w-24"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-8 bg-neutral-200 rounded w-20"></div>
            </td>
          </tr>
        ))}
      </>
    )
  }

  return (
    <>
      {skeletons.map((id) => (
        <div
          key={id}
          className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 animate-pulse"
        >
          <div className="space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </>
  )
}
