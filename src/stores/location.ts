import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LocationData } from '@/services/geocoding'
import {
  getLocationInfo,
  findNearbyInterestingLocations,
  type LocationInfo,
  type NearbyLocation,
  type LocationInfoResult,
  type NearbyLocationsResult
} from '@/services/location-info'

export const useLocationStore = defineStore('location', () => {
  // Current location data
  const currentLocation = ref<LocationData | null>(null)

  // Cached location info data (About tab)
  const locationInfo = ref<LocationInfo | null>(null)
  const locationInfoLoading = ref(false)
  const locationInfoError = ref<string | null>(null)

  // Cached nearby locations data (Nearby tab)
  const nearbyLocations = ref<NearbyLocation[]>([])
  const nearbyLocationsLoading = ref(false)
  const nearbyLocationsError = ref<string | null>(null)

  // Track the location for which we have cached data
  const cachedLocationKey = ref<string | null>(null)

  // Helper function to generate a unique key for a location
  const getLocationKey = (location: LocationData): string => {
    return `${location.lat.toFixed(6)}_${location.lng.toFixed(6)}`
  }

  // Check if we need to fetch new data
  const needsUpdate = (location: LocationData): boolean => {
    const newKey = getLocationKey(location)
    return cachedLocationKey.value !== newKey
  }

  // Update current location
  const setCurrentLocation = (location: LocationData) => {
    currentLocation.value = location
  }

  // Fetch location info (About tab data)
  const fetchLocationInfo = async (location: LocationData) => {
    // Check if we already have data for this location
    const locationKey = getLocationKey(location)
    if (cachedLocationKey.value === locationKey && locationInfo.value) {
      return // Data already cached
    }

    locationInfoLoading.value = true
    locationInfoError.value = null

    try {
      const locationName = `${location.locality ?? ''}, ${location.city}`
      const detailedLocation = {
        name: locationName,
        city: location.city,
        sublocality: location.locality,
        latitude: location.lat,
        longitude: location.lng
      }

      const result: LocationInfoResult = await getLocationInfo(detailedLocation)

      if (result.success && result.data) {
        locationInfo.value = result.data
        cachedLocationKey.value = locationKey
      } else {
        locationInfoError.value = result.error?.message || 'Failed to get location information.'
      }
    } catch (error) {
      locationInfoError.value = 'An unexpected error occurred while getting location details.'
    } finally {
      locationInfoLoading.value = false
    }
  }

  // Fetch nearby locations (Nearby tab data)
  const fetchNearbyLocations = async (location: LocationData) => {
    // Check if we already have data for this location
    const locationKey = getLocationKey(location)
    if (cachedLocationKey.value === locationKey && nearbyLocations.value.length > 0) {
      return // Data already cached
    }

    nearbyLocationsLoading.value = true
    nearbyLocationsError.value = null

    try {
      const locationName = `${location.locality ?? ''}, ${location.city}`
      const detailedLocation = {
        name: locationName,
        city: location.city,
        sublocality: location.locality,
        latitude: location.lat,
        longitude: location.lng
      }

      const result: NearbyLocationsResult = await findNearbyInterestingLocations(detailedLocation)

      if (result.success && result.data) {
        nearbyLocations.value = result.data
        cachedLocationKey.value = locationKey
      } else {
        nearbyLocationsError.value = result.error?.message || 'Failed to get nearby locations.'
      }
    } catch (error) {
      nearbyLocationsError.value = 'An unexpected error occurred while finding nearby locations.'
    } finally {
      nearbyLocationsLoading.value = false
    }
  }

  // Clear all cached data
  const clearCache = () => {
    locationInfo.value = null
    locationInfoError.value = null
    nearbyLocations.value = []
    nearbyLocationsError.value = null
    cachedLocationKey.value = null
  }

  return {
    // State
    currentLocation,
    locationInfo,
    locationInfoLoading,
    locationInfoError,
    nearbyLocations,
    nearbyLocationsLoading,
    nearbyLocationsError,

    // Actions
    setCurrentLocation,
    fetchLocationInfo,
    fetchNearbyLocations,
    needsUpdate,
    clearCache
  }
})
