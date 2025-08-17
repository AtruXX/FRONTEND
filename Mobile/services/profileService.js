import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => 'profile/',
      providesTags: ['Profile'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data: profileData } = await queryFulfilled;
          console.log('Profile data received:', profileData);

          // Store profile information in AsyncStorage
          const storagePromises = [];

          if (profileData.id) {
            storagePromises.push(
              AsyncStorage.setItem('driverId', profileData.id.toString())
            );
          }

          if (profileData.name) {
            storagePromises.push(
              AsyncStorage.setItem('userName', profileData.name)
            );
          }

          if (profileData.company) {
            storagePromises.push(
              AsyncStorage.setItem('userCompany', profileData.company)
            );
          }

          if (profileData.is_driver !== undefined) {
            storagePromises.push(
              AsyncStorage.setItem('isDriver', profileData.is_driver.toString())
            );
          }

          if (profileData.is_dispatcher !== undefined) {
            storagePromises.push(
              AsyncStorage.setItem('isDispatcher', profileData.is_dispatcher.toString())
            );
          }

          await Promise.all(storagePromises);
          console.log('Profile data stored in AsyncStorage');
        } catch (error) {
          console.error('Error storing profile data:', error);
        }
      },
    }),
    
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: 'profile/',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
      // Optimistic update
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          profileApi.util.updateQueryData('getProfile', undefined, (draft) => {
            Object.assign(draft, patch);
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
  useGetProfileQuery,
  useUpdateProfileMutation,
} = profileApi;
