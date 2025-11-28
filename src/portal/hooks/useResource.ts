import useSWR from "swr"
import type { Resource } from "../../../shared/types.ts"

interface ResourceResponse {
  success: boolean
  data: Resource
}

export const useResource = (id: string | undefined) => {
  const key = id ? `/resources/${id}` : null
  const { data, error, isLoading, mutate } = useSWR<ResourceResponse>(key)

  return {
    resource: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
