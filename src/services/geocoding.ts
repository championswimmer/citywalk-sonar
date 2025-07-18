export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  locality: string;
}

export interface GeocodingError {
  message: string;
  code?: string;
}

export interface GeocodingResult {
  success: boolean;
  data?: LocationData;
  error?: GeocodingError;
}

/**
 * Get the user's current location using geolocation API and reverse geocoding
 * @param geocoding - Google Maps geocoding library
 * @returns Promise with location data or error
 */
export async function getCurrentLocation(
  geocoding: google.maps.GeocodingLibrary
): Promise<GeocodingResult> {
  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      return {
        success: false,
        error: {
          message: 'Geolocation is not supported by this browser.',
          code: 'NOT_SUPPORTED'
        }
      };
    }

    // Check if geocoding service is available
    if (!geocoding) {
      return {
        success: false,
        error: {
          message: 'Geocoding service is not available.',
          code: 'SERVICE_UNAVAILABLE'
        }
      };
    }

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
      console.log(response.results);

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

      return {
        success: true,
        data: {
          lat: latitude,
          lng: longitude,
          city: city || 'Unknown',
          locality: locality || 'Unknown'
        }
      };
    } else {
      return {
        success: false,
        error: {
          message: 'Could not find address for your location.',
          code: 'ADDRESS_NOT_FOUND'
        }
      };
    }
  } catch (err) {
    if (err instanceof GeolocationPositionError) {
      let message = 'An unknown error occurred while getting location.';
      let code = 'UNKNOWN_ERROR';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          message = 'Location access denied by user.';
          code = 'PERMISSION_DENIED';
          break;
        case err.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable.';
          code = 'POSITION_UNAVAILABLE';
          break;
        case err.TIMEOUT:
          message = 'Location request timed out.';
          code = 'TIMEOUT';
          break;
      }

      return {
        success: false,
        error: { message, code }
      };
    } else {
      return {
        success: false,
        error: {
          message: 'Failed to get location information.',
          code: 'GEOCODING_ERROR'
        }
      };
    }
  }
}

/**
 * Parse address components to extract city and locality information
 * @param addressComponents - Google Maps address components
 * @returns Object with city and locality
 */
export function parseAddressComponents(
  addressComponents: google.maps.GeocoderAddressComponent[]
): { city: string; locality: string } {
  let city = '';
  let locality = '';

  addressComponents.forEach((component) => {
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

  return {
    city: city || 'Unknown',
    locality: locality || 'Unknown'
  };
}
