<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { LocationData } from '@/services/geocoding';
import { useLocationStore } from '@/stores/location';

// Props from parent
interface Props {
  locationData: LocationData;
}

const props = defineProps<Props>();

// Use the location store
const locationStore = useLocationStore();
const {
  locationInfo,
  locationInfoLoading: isLoading,
  locationInfoError: error
} = storeToRefs(locationStore);

// Fetch data when component is mounted
onMounted(() => {
  locationStore.fetchLocationInfo(props.locationData);
});

// Watch for location data changes
watch(() => props.locationData, (newLocation) => {
  // Only fetch if location has changed
  if (locationStore.needsUpdate(newLocation)) {
    locationStore.fetchLocationInfo(newLocation);
  }
});
</script>

<template>
  <div style="
    background-color: #f8f9fa;
    border-radius: 0.375rem;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
  ">
    <h3 style="margin: 0 0 1rem 0; color: #495057;">About {{ props.locationData.locality }}</h3>

    <!-- Loading state -->
    <div v-if="isLoading" style="
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    ">
      <div style="margin-bottom: 1rem;">🔄 Loading location information...</div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" style="
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 0.375rem;
      padding: 1rem;
      color: #721c24;
      text-align: center;
    ">
      {{ error }}
    </div>

    <!-- Location info content -->
    <div v-else-if="locationInfo" style="color: #495057; line-height: 1.6;">
      <!-- Description -->
      <div style="margin-bottom: 1.5rem;">
        <p style="margin: 0; font-size: 1.1rem;">{{ locationInfo.description }}</p>
      </div>

      <!-- History -->
      <div v-if="locationInfo.history" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🏛️ History</h4>
        <p style="margin: 0;">{{ locationInfo.history }}</p>
      </div>

      <!-- Culture -->
      <div v-if="locationInfo.culture" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🎭 Culture</h4>
        <p style="margin: 0;">{{ locationInfo.culture }}</p>
      </div>

      <!-- Attractions -->
      <div v-if="locationInfo.attractions && locationInfo.attractions.length > 0" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🎯 Attractions</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li v-for="attraction in locationInfo.attractions" :key="attraction" style="margin-bottom: 0.25rem;">
            {{ attraction }}
          </li>
        </ul>
      </div>

      <!-- Demographics -->
      <div v-if="locationInfo.demographics" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">👥 Demographics</h4>
        <p style="margin: 0;">{{ locationInfo.demographics }}</p>
      </div>

      <!-- Economy -->
      <div v-if="locationInfo.economy" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">💼 Economy</h4>
        <p style="margin: 0;">{{ locationInfo.economy }}</p>
      </div>

      <!-- Climate -->
      <div v-if="locationInfo.climate" style="margin-bottom: 0;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🌤️ Climate</h4>
        <p style="margin: 0;">{{ locationInfo.climate }}</p>
      </div>
    </div>

    <!-- No data available (initial state) -->
    <div v-else style="
      background-color: #fff3cd;
      border-radius: 0.25rem;
      padding: 1rem;
      border: 1px solid #ffeaa7;
      text-align: center;
    ">
      <div style="color: #856404; margin-bottom: 0.5rem;">
        📍 Loading information about {{ props.locationData.city }}...
      </div>
      <small style="color: #6c757d;">
        This will include history, culture, attractions, demographics, and more.
      </small>
    </div>
  </div>
</template>
