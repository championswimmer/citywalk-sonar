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

// Tab management state
const activeTab = ref<'about' | 'nearby'>('about');

// Function to switch tabs
const switchTab = (tab: 'about' | 'nearby') => {
  if (locationData.value) {
    activeTab.value = tab;
  }
};

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
        <div style="font-size: 0.875rem; color: #6c757d;">
          <strong>Coordinates:</strong> {{ locationData.lat.toFixed(6) }}, {{ locationData.lng.toFixed(6) }}
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
          <button @click="switchTab('about')" :class="{ active: activeTab === 'about' }" style="
              padding: 0.75rem 1.5rem;
              background: none;
              border: none;
              border-bottom: 2px solid transparent;
              cursor: pointer;
              font-size: 1rem;
              transition: all 0.2s;
            " :style="{
              borderBottomColor: activeTab === 'about' ? '#007bff' : 'transparent',
              color: activeTab === 'about' ? '#007bff' : '#6c757d',
              fontWeight: activeTab === 'about' ? 'bold' : 'normal'
            }">
            About
          </button>
          <button @click="switchTab('nearby')" :class="{ active: activeTab === 'nearby' }" style="
              padding: 0.75rem 1.5rem;
              background: none;
              border: none;
              border-bottom: 2px solid transparent;
              cursor: pointer;
              font-size: 1rem;
              transition: all 0.2s;
            " :style="{
              borderBottomColor: activeTab === 'nearby' ? '#007bff' : 'transparent',
              color: activeTab === 'nearby' ? '#007bff' : '#6c757d',
              fontWeight: activeTab === 'nearby' ? 'bold' : 'normal'
            }">
            Nearby
          </button>
        </div>

        <!-- Tab Content -->
        <div style="min-height: 300px; padding: 1rem;">
          <!-- About Tab -->
          <div v-if="activeTab === 'about'" style="
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 1.5rem;
            border: 1px solid #e9ecef;
          ">
            <h3 style="margin: 0 0 1rem 0; color: #495057;">About {{ locationData.city }}</h3>
            <p style="color: #6c757d; line-height: 1.6; margin: 0;">
              Information about {{ locationData.city }}, {{ locationData.locality }} will be loaded here.
              This will include details about the area, demographics, points of interest, and other relevant
              information.
            </p>
            <div
              style="margin-top: 1rem; padding: 0.75rem; background-color: #fff3cd; border-radius: 0.25rem; border: 1px solid #ffeaa7;">
              <small style="color: #856404;">
                📍 Content will be populated after implementing data fetching functionality.
              </small>
            </div>
          </div>

          <!-- Nearby Tab -->
          <div v-if="activeTab === 'nearby'" style="
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 1.5rem;
            border: 1px solid #e9ecef;
          ">
            <h3 style="margin: 0 0 1rem 0; color: #495057;">Nearby Places</h3>
            <p style="color: #6c757d; line-height: 1.6; margin: 0;">
              Nearby places and points of interest around {{ locationData.city }}, {{ locationData.locality }} will be
              displayed here.
              This will include restaurants, shops, attractions, and other venues in the area.
            </p>
            <div
              style="margin-top: 1rem; padding: 0.75rem; background-color: #fff3cd; border-radius: 0.25rem; border: 1px solid #ffeaa7;">
              <small style="color: #856404;">
                🗺️ Content will be populated after implementing nearby places API integration.
              </small>
            </div>
          </div>
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
