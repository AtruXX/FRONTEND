import { api } from './api';
export const driverApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: () => 'drivers',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Driver', id })), 'Driver']
          : ['Driver'],
      // Mobile-optimized settings
      keepUnusedDataFor: 300, // 5 minutes
    }),
    addDriver: builder.mutation({
      query: (driverData) => ({
        url: 'drivers',
        method: 'POST',
        body: driverData,
      }),
      invalidatesTags: ['Driver'],
    }),
    deleteDriver: builder.mutation({
      query: (driverId) => ({
        url: `drivers/${driverId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, driverId) => [
        { type: 'Driver', id: driverId },
        'Driver'
      ],
    }),
    getTotalDrivers: builder.query({
      query: () => 'drivers/total',
      providesTags: ['Driver'],
    }),
    getDriversOnRoad: builder.query({
      query: () => 'drivers/on-road',
      providesTags: ['Driver'],
      // Refetch every 30 seconds for real-time data
      pollingInterval: 30000,
    }),
    giveRating: builder.mutation({
      query: ({ driverId, rating }) => ({
        url: `drivers/${driverId}/rating`,
        method: 'PATCH',
        body: { rating },
      }),
      invalidatesTags: (result, error, { driverId }) => [
        { type: 'Driver', id: driverId }
      ],
    }),
    changeDriverStatus: builder.mutation({
      query: ({ driverId, status }) => ({
        url: `drivers/${driverId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { driverId }) => [
        { type: 'Driver', id: driverId },
        'Driver' // Also invalidate the list
      ],
      // Optimistic update for better UX
      async onQueryStarted({ driverId, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          driverApi.util.updateQueryData('getDrivers', undefined, (draft) => {
            const driver = draft.find(d => d.id === driverId);
            if (driver) {
              driver.status = status;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});
export const {
  useGetDriversQuery,
  useAddDriverMutation,
  useDeleteDriverMutation,
  useGetTotalDriversQuery,
  useGetDriversOnRoadQuery,
  useGiveRatingMutation,
  useChangeDriverStatusMutation,
} = driverApi;
