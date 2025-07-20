<script setup lang="ts">
import type { LocationData } from '@/services/geocoding';
import type { NearbyLocation } from '@/services/location-info';

// Props from parent
interface Props {
  locationData: LocationData;
  nearbyLocations: NearbyLocation[];
  isLoadingInfo: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div style="
    background-color: #f8f9fa;
    border-radius: 0.375rem;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
  ">
    <h3 style="margin: 0 0 1rem 0; color: #495057;">Nearby Places</h3>

    <!-- Loading state -->
    <div v-if="props.isLoadingInfo" style="
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    ">
      <div style="margin-bottom: 1rem;">🔄 Finding nearby interesting locations...</div>
    </div>

    <!-- Nearby locations content -->
    <div v-else-if="props.nearbyLocations && props.nearbyLocations.length > 0">
      <div v-for="(location, index) in props.nearbyLocations" :key="index" style="
          background-color: #fff;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
        <h4 style="margin: 0 0 0.5rem 0; color: #495057;">{{ location.name }}</h4>
        <div style="
          color: #6c757d;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        ">
          <span style="
            background-color: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
          ">
            {{ location.category }}
          </span>
          <span v-if="location.distance" style="margin-left: 0.5rem;">
            📍 {{ location.distance }}
          </span>
          <span v-if="location.rating" style="margin-left: 0.5rem;">
            ⭐ {{ location.rating }}/5
          </span>
        </div>
        <div style="
          color: #495057;
          line-height: 1.6;
          white-space: pre-wrap;
          font-size: 0.875rem;
        ">
          {{ location.description }}
        </div>
        <div v-if="location.whyInteresting" style="
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #f0f8ff;
          border-radius: 0.25rem;
          border-left: 3px solid #007bff;
          font-size: 0.875rem;
          color: #495057;
        ">
          <strong>Why it's interesting:</strong> {{ location.whyInteresting }}
        </div>
      </div>
    </div>

    <!-- No data available -->
    <div v-else style="
      background-color: #fff3cd;
      border-radius: 0.25rem;
      padding: 1rem;
      border: 1px solid #ffeaa7;
      text-align: center;
    ">
      <div style="color: #856404; margin-bottom: 0.5rem;">
        🗺️ Click "Know More" to discover interesting places around {{ props.locationData.city }}
      </div>
      <small style="color: #6c757d;">
        This will include restaurants, attractions, museums, parks, and other venues in the area.
      </small>
    </div>
  </div>
</template>
