import { useMutation } from '@tanstack/react-query'
import api from '../api/client'

export function useForecast() {
  return useMutation({
    mutationFn: (productId) => api.post(`/ai/forecast/${productId}`),
  })
}
