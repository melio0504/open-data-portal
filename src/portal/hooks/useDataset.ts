import useSWR from "swr"
import type { DatasetDetail } from "../../../shared/types.ts"

interface DatasetResponse {
  success: boolean
  data: DatasetDetail
}

export const useDataset = (id: string | undefined) => {
  const key = id ? `/datasets/${id}` : null
  const { data, error, isLoading, mutate } = useSWR<DatasetResponse>(key)

  return {
    dataset: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
