<script setup lang="ts">
import { inject, ref } from 'vue';
import { getCurrentLocation, type LocationData } from '@/services/geocoding';
import { getLocationPackage, type LocationInfo, type NearbyLocation } from '@/services/location-info';

const geocoding = inject<google.maps.GeocodingLibrary>('geocoding')

console.log(geocoding)

// Reactive state
const isLoading = ref(false);
const error = ref<string | null>(null);
const locationData = ref<LocationData | null>(null);

// Location info state
const isLoadingInfo = ref(false);
const infoError = ref<string | null>(null);
const locationInfo = ref<LocationInfo | null>(null);
const nearbyLocations = ref<NearbyLocation[]>([]);

// No longer need tab management - using router instead

// Function to get user's current location
const locateMe = async () => {
  if (!geocoding) {
    error.value = 'Geocoding service is not available.';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const result = await getCurrentLocation(geocoding);

    if (result.success && result.data) {
      locationData.value = result.data;
    } else {
      error.value = result.error?.message || 'Failed to get location information.';
    }
  } catch {
    error.value = 'An unexpected error occurred while getting location.';
  } finally {
    isLoading.value = false;
  }
};

// Function to get location information using AI
const knowMore = async () => {
  if (!locationData.value) {
    return;
  }

  isLoadingInfo.value = true;
  infoError.value = null;

  try {
    const locationName = `${locationData.value.locality ?? ''}, ${locationData.value.city}`;
    const detailedLocation = {
      name: locationName,
      city: locationData.value.city,
      sublocality: locationData.value.locality,
      latitude: locationData.value.lat,
      longitude: locationData.value.lng
    };
    const result = await getLocationPackage(detailedLocation);

    if (result.locationInfo.success && result.locationInfo.data) {
      locationInfo.value = result.locationInfo.data;
    } else {
      infoError.value = result.locationInfo.error?.message || 'Failed to get location information.';
    }

    if (result.nearbyLocations.success && result.nearbyLocations.data) {
      nearbyLocations.value = result.nearbyLocations.data;
    } else {
      infoError.value = result.nearbyLocations.error?.message || 'Failed to get nearby locations.';
    }
  } catch {
    infoError.value = 'An unexpected error occurred while getting location details.';
  } finally {
    isLoadingInfo.value = false;
  }
};
</script>

<template>
  <main>
    <div style="margin-top: 2rem;">
      <button @click="locateMe" :disabled="isLoading" style="
          padding: 0.75rem 1.5rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        " :style="{
          backgroundColor: isLoading ? '#6c757d' : '#007bff',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }">
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

    <!-- Responsive Layout Container -->
    <div v-if="locationData" class="responsive-container" style="
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    ">
      <!-- Location information box -->
      <div class="location-info" style="
        padding: 1rem;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 0.375rem;
        color: #155724;
        flex: 1;
        min-width: 0;
      ">
        <h3 style="margin: 0 0 0.5rem 0;">Your Location</h3>
        <div style="margin-bottom: 0.5rem;">
          <strong>City:</strong> {{ locationData.city }}
        </div>
        <div style="margin-bottom: 0.5rem;">
          <strong>Locality:</strong> {{ locationData.locality }}
        </div>
        <div style="font-size: 0.875rem; color: #6c757d; margin-bottom: 1rem;">
          <strong>Coordinates:</strong> {{ locationData.lat.toFixed(6) }}, {{ locationData.lng.toFixed(6) }}
        </div>

        <!-- Know More Button -->
        <button @click="knowMore" :disabled="isLoadingInfo || !locationData" style="
            padding: 0.5rem 1rem;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.2s;
            width: 100%;
          " :style="{
            backgroundColor: isLoadingInfo ? '#6c757d' : '#28a745',
            cursor: isLoadingInfo ? 'not-allowed' : 'pointer'
          }">
          {{ isLoadingInfo ? 'Loading...' : 'Know More' }}
        </button>

        <!-- Info Error message -->
        <div v-if="infoError" style="
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 0.25rem;
          color: #721c24;
          font-size: 0.875rem;
        ">
          {{ infoError }}
        </div>
      </div>

      <!-- Tab Navigation and Content -->
      <div class="tabs-container" style="flex: 1; min-width: 0;">
        <!-- Tab Navigation -->
        <div style="
          display: flex;
          border-bottom: 2px solid #e9ecef;
          margin-bottom: 1rem;
        ">
          <router-link to="/about" custom v-slot="{ isActive, navigate }">
            <button @click="navigate" :style="{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: '2px solid',
              borderBottomColor: isActive ? '#007bff' : 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
              color: isActive ? '#007bff' : '#6c757d',
              fontWeight: isActive ? 'bold' : 'normal'
            }">
              About
            </button>
          </router-link>
          <router-link to="/nearby" custom v-slot="{ isActive, navigate }">
            <button @click="navigate" :style="{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: '2px solid',
              borderBottomColor: isActive ? '#007bff' : 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
              color: isActive ? '#007bff' : '#6c757d',
              fontWeight: isActive ? 'bold' : 'normal'
            }">
              Nearby
            </button>
          </router-link>
        </div>

        <!-- Tab Content -->
        <div style="min-height: 300px; padding: 1rem;">
          <router-view v-if="locationData" :location-data="locationData" :location-info="locationInfo"
            :nearby-locations="nearbyLocations" :is-loading-info="isLoadingInfo" />
        </div>
      </div>
    </div>

    <!-- Disabled tabs message -->
    <div v-if="!locationData && !isLoading" style="
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 0.375rem;
      color: #6c757d;
      text-align: center;
    ">
      <p style="margin: 0;">
        📍 Please locate yourself first to access the About and Nearby tabs.
      </p>
    </div>
  </main>
</template>

<style scoped>
/* Responsive layout for large screens */
@media (min-width: 1024px) {
  .responsive-container {
    flex-direction: row !important;
    align-items: flex-start;
  }

  .location-info {
    max-width: 400px;
    height: fit-content;
  }

  .tabs-container {
    flex: 2;
  }
}

/* Responsive layout for extra large screens */
@media (min-width: 1280px) {
  .responsive-container {
    gap: 3rem;
  }

  .location-info {
    max-width: 450px;
  }
}
</style>
