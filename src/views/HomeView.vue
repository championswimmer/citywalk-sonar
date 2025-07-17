<script setup lang="ts">
import { inject, ref } from 'vue';

const geocoding = inject<google.maps.GeocodingLibrary>('geocoding')

console.log(geocoding)

// Reactive state
const isLoading = ref(false);
const error = ref<string | null>(null);
const locationData = ref<{
  lat: number;
  lng: number;
  city: string;
  locality: string;
} | null>(null);

// Function to get user's current location
const locateMe = async () => {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by this browser.';
    return;
  }

  if (!geocoding) {
    error.value = 'Geocoding service is not available.';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // Get current position
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });

    const { latitude, longitude } = position.coords;

    // Use geocoding to get address details
    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({
      location: { lat: latitude, lng: longitude }
    });

    if (response.results && response.results.length > 0) {
      const result = response.results[0];

      // Extract city and locality from address components
      let city = '';
      let locality = '';

      result.address_components.forEach((component) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('sublocality_level_1') || component.types.includes('sublocality')) {
          locality = component.long_name;
        }
        // Fallback for city if locality not found
        if (!city && component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
      });

      locationData.value = {
        lat: latitude,
        lng: longitude,
        city: city || 'Unknown',
        locality: locality || 'Unknown'
      };
    } else {
      error.value = 'Could not find address for your location.';
    }
  } catch (err) {
    if (err instanceof GeolocationPositionError) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          error.value = 'Location access denied by user.';
          break;
        case err.POSITION_UNAVAILABLE:
          error.value = 'Location information is unavailable.';
          break;
        case err.TIMEOUT:
          error.value = 'Location request timed out.';
          break;
        default:
          error.value = 'An unknown error occurred while getting location.';
          break;
      }
    } else {
      error.value = 'Failed to get location information.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main>
    <h1>Hello World</h1>

    <div style="margin-top: 2rem;">
      <button
        @click="locateMe"
        :disabled="isLoading"
        style="
          padding: 0.75rem 1.5rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        "
        :style="{
          backgroundColor: isLoading ? '#6c757d' : '#007bff',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }"
      >
        {{ isLoading ? 'Locating...' : 'Locate Me' }}
      </button>
    </div>

    <!-- Error message -->
    <div v-if="error" style="
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 0.375rem;
      color: #721c24;
    ">
      {{ error }}
    </div>

    <!-- Location information box -->
    <div v-if="locationData" style="
      margin-top: 1rem;
      padding: 1rem;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 0.375rem;
      color: #155724;
    ">
      <h3 style="margin: 0 0 0.5rem 0;">Your Location</h3>
      <div style="margin-bottom: 0.5rem;">
        <strong>City:</strong> {{ locationData.city }}
      </div>
      <div style="margin-bottom: 0.5rem;">
        <strong>Locality:</strong> {{ locationData.locality }}
      </div>
      <div style="font-size: 0.875rem; color: #6c757d;">
        <strong>Coordinates:</strong> {{ locationData.lat.toFixed(6) }}, {{ locationData.lng.toFixed(6) }}
      </div>
    </div>
  </main>
</template>
