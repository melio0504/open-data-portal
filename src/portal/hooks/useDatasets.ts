import useSWR from "swr"
import type { DatasetListItem, PaginationInfo } from "../../../shared/types.ts"

interface DatasetsFilters {
  search?: string
  category_id?: string
  publisher_id?: string
  tag?: string
  format?: string
  sort?: string
  limit?: number
  offset?: number
}

interface DatasetsResponse {
  success: boolean
  data: DatasetListItem[]
  pagination: PaginationInfo
}

export const useDatasets = (filters: DatasetsFilters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value))
    }
  })

  const key = `/datasets?${params.toString()}`
  const { data, error, isLoading, mutate } = useSWR<DatasetsResponse>(key)

  return {
    datasets: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
