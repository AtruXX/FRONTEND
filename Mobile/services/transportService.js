import { api } from './api';

export const transportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransports: builder.query({
      query: (params = {}) => ({
        url: 'transports',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Transport', id })), 'Transport']
          : ['Transport'],
    }),
    
    getTransportByDriverId: builder.query({
      query: (driverId) => `transports?driver_id=${driverId}`,
      providesTags: (result, error, driverId) => [
        { type: 'Transport', id: `driver-${driverId}` }
      ],
      // Mobile-optimized settings
      keepUnusedDataFor: 300, // 5 minutes
    }),
    
    createTransport: builder.mutation({
      query: (transportData) => ({
        url: 'transports',
        method: 'POST',
        body: transportData,
      }),
      invalidatesTags: ['Transport'],
    }),
    
    updateTransport: builder.mutation({
      query: ({ transportId, ...data }) => ({
        url: `transports/${transportId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { transportId }) => [
        { type: 'Transport', id: transportId }
      ],
    }),
    
    deleteTransport: builder.mutation({
      query: (transportId) => ({
        url: `transports/${transportId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, transportId) => [
        { type: 'Transport', id: transportId },
        'Transport'
      ],
    }),
    
    getActiveTransports: builder.query({
      query: () => 'transports/active',
      providesTags: ['Transport'],
    }),
    
    getInactiveTransports: builder.query({
      query: () => 'transports/inactive',
      providesTags: ['Transport'],
    }),
    
    assignTransportByDriver: builder.mutation({
      query: ({ transportId, driverId }) => ({
        url: `transports/${transportId}/assign`,
        method: 'PATCH',
        body: { driverId },
      }),
      invalidatesTags: (result, error, { transportId, driverId }) => [
        { type: 'Transport', id: transportId },
        { type: 'Transport', id: `driver-${driverId}` },
        'Transport'
      ],
    }),
  }),
});

export const {
  useGetAllTransportsQuery,
  useGetTransportByDriverIdQuery,
  useCreateTransportMutation,
  useUpdateTransportMutation,
  useDeleteTransportMutation,
  useGetActiveTransportsQuery,
  useGetInactiveTransportsQuery,
  useAssignTransportByDriverMutation,
} = transportApi;
