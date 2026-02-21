import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

export function useShipments(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.carrier) params.set('carrier', filters.carrier)
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: () => api.get(`/shipments?${params}`),
  })
}

export function useShipment(id) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: () => api.get(`/shipments/${id}`),
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/shipments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipments'] }),
  })
}

export function useUpdateShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/shipments/${id}`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['shipments'] })
      qc.invalidateQueries({ queryKey: ['shipment', id] })
    },
  })
}

export function useDeleteShipment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/shipments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shipments'] }),
  })
}

export function useAddShipmentEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ shipmentId, ...data }) => api.post(`/shipments/${shipmentId}/events`, data),
    onSuccess: (_, { shipmentId }) => qc.invalidateQueries({ queryKey: ['shipment', shipmentId] }),
  })
}
