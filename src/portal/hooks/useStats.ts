import useSWR from "swr"
import type { Stats } from "../../../shared/types.ts"

interface StatsResponse {
  success: boolean
  data: Stats
}

export const useStats = () => {
  const { data, error, isLoading, mutate } = useSWR<StatsResponse>("/stats")

  return {
    stats: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
