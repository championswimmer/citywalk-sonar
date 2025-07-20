<script setup lang="ts">
import type { LocationData } from '@/services/geocoding';
import type { LocationInfo } from '@/services/location-info';

// Props from parent
interface Props {
  locationData: LocationData;
  locationInfo: LocationInfo | null;
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
    <h3 style="margin: 0 0 1rem 0; color: #495057;">About {{ props.locationData.city }}</h3>

    <!-- Loading state -->
    <div v-if="props.isLoadingInfo" style="
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    ">
      <div style="margin-bottom: 1rem;">🔄 Loading location information...</div>
    </div>

    <!-- Location info content -->
    <div v-else-if="props.locationInfo" style="color: #495057; line-height: 1.6;">
      <!-- Description -->
      <div style="margin-bottom: 1.5rem;">
        <p style="margin: 0; font-size: 1.1rem;">{{ props.locationInfo.description }}</p>
      </div>

      <!-- History -->
      <div v-if="props.locationInfo.history" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🏛️ History</h4>
        <p style="margin: 0;">{{ props.locationInfo.history }}</p>
      </div>

      <!-- Culture -->
      <div v-if="props.locationInfo.culture" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🎭 Culture</h4>
        <p style="margin: 0;">{{ props.locationInfo.culture }}</p>
      </div>

      <!-- Attractions -->
      <div v-if="props.locationInfo.attractions && props.locationInfo.attractions.length > 0"
        style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🎯 Attractions</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li v-for="attraction in props.locationInfo.attractions" :key="attraction" style="margin-bottom: 0.25rem;">
            {{ attraction }}
          </li>
        </ul>
      </div>

      <!-- Demographics -->
      <div v-if="props.locationInfo.demographics" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">👥 Demographics</h4>
        <p style="margin: 0;">{{ props.locationInfo.demographics }}</p>
      </div>

      <!-- Economy -->
      <div v-if="props.locationInfo.economy" style="margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">💼 Economy</h4>
        <p style="margin: 0;">{{ props.locationInfo.economy }}</p>
      </div>

      <!-- Climate -->
      <div v-if="props.locationInfo.climate" style="margin-bottom: 0;">
        <h4 style="margin: 0 0 0.5rem 0; color: #007bff; font-size: 1rem;">🌤️ Climate</h4>
        <p style="margin: 0;">{{ props.locationInfo.climate }}</p>
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
        📍 Click "Know More" to get detailed information about {{ props.locationData.city }}
      </div>
      <small style="color: #6c757d;">
        This will include history, culture, attractions, demographics, and more.
      </small>
    </div>
  </div>
</template>
