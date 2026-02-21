import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard/metrics'),
    refetchInterval: 30000,
  })
}
