import { generateAIText, generateAIObject, readPromptTemplate, processPromptTemplate } from './aisdk';
import { z } from 'zod';

export interface DetailedLocation {
  name: string;
  city?: string;
  sublocality?: string;
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  name: string;
  description: string;
  history?: string;
  culture?: string;
  attractions?: string[];
  demographics?: string;
  economy?: string;
  climate?: string;
}

export interface NearbyLocation {
  name: string;
  description: string;
  category: string;
  distance?: string;
  rating?: number;
  whyInteresting: string;
}

export interface LocationInfoError {
  message: string;
  code?: string;
}

export interface LocationInfoResult {
  success: boolean;
  data?: LocationInfo;
  error?: LocationInfoError;
}

export interface NearbyLocationsResult {
  success: boolean;
  data?: NearbyLocation[];
  error?: LocationInfoError;
}

// Zod schemas for structured responses
export const LocationInfoSchema = z.object({
  name: z.string().min(1).describe('Name of the location'),
  description: z.string().min(1).describe('Brief description of the location (2-3 sentences)'),
  history: z.string().min(1).optional().describe('Historical background and significance'),
  culture: z.string().min(1).optional().describe('Cultural aspects and traditions'),
  attractions: z.array(z.string().min(1)).min(1).optional().describe('Array of main tourist attractions and points of interest'),
  demographics: z.string().min(1).optional().describe('Population and demographic information'),
  economy: z.string().min(1).optional().describe('Economic activities and industries'),
  climate: z.string().min(1).optional().describe('Climate and weather patterns'),
});

export const NearbyLocationSchema = z.object({
  name: z.string().min(1).describe('Name of the nearby location'),
  description: z.string().min(1).describe('Description of what makes this location interesting'),
  category: z.string().min(1).describe('Category of the location (e.g., restaurant, museum, park, etc.)'),
  distance: z.string().optional().describe('Approximate distance from the main location (e.g., "2.5 km", "500 m")'),
  rating: z.number().min(0).max(5).optional().describe('Rating or popularity score between 0-5 if available'),
  whyInteresting: z.string().min(1).describe('Explanation of why this location is worth visiting'),
});

export const NearbyLocationsSchema = z.array(NearbyLocationSchema);

/**
 * Get comprehensive information about a location using Perplexity Sonar Pro
 * @param location - Detailed location information including name, city, sublocality, and coordinates
 * @returns Promise with location information or error
 */
export async function getLocationInfo(location: DetailedLocation): Promise<LocationInfoResult> {
  try {
    if (!location || !location.name || location.name.trim() === '') {
      return {
        success: false,
        error: {
          message: 'Location name is required.',
          code: 'INVALID_INPUT'
        }
      };
    }

    const promptTemplate = await readPromptTemplate('about.txt');
    const prompt = processPromptTemplate(promptTemplate, {
      location: location.name,
      city: location.city || 'Not specified',
      sublocality: location.sublocality || 'Not specified',
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    });

    let locationInfo: LocationInfo;

    try {
      locationInfo = await generateAIObject(prompt, {
        model: 'sonar',
        temperature: 0.3,
        maxTokens: 1000,
        schema: LocationInfoSchema,
      });
    } catch (error) {
      console.error('Structured response failed, falling back to text parsing:', error);

      // Fallback to text generation if structured response fails
      const textResponse = await generateAIText(prompt, {
        model: 'sonar',
        temperature: 0.3,
        maxTokens: 1000,
      });

      // Create basic structure with text response
      locationInfo = {
        name: location.name,
        description: textResponse,
      };
    }

    return {
      success: true,
      data: locationInfo
    };

  } catch (error) {
    console.error('Error getting location info:', error);
    return {
      success: false,
      error: {
        message: 'Failed to get location information. Please try again.',
        code: 'API_ERROR'
      }
    };
  }
}

/**
 * Find nearby interesting locations using Perplexity Sonar Reasoning
 * @param location - Detailed location information including name, city, sublocality, and coordinates
 * @param radius - Search radius (optional, defaults to "10 km")
 * @param interests - Array of interest categories (optional)
 * @returns Promise with nearby locations or error
 */
export async function findNearbyInterestingLocations(
  location: DetailedLocation,
  radius: string = '10 km',
  interests: string[] = ['tourist attractions', 'restaurants', 'museums', 'parks', 'historical sites']
): Promise<NearbyLocationsResult> {
  try {
    if (!location || !location.name || location.name.trim() === '') {
      return {
        success: false,
        error: {
          message: 'Location name is required.',
          code: 'INVALID_INPUT'
        }
      };
    }

    const interestsList = interests.join(', ');
    const promptTemplate = await readPromptTemplate('nearby.txt');
    const prompt = processPromptTemplate(promptTemplate, {
      location: location.name,
      city: location.city || 'Not specified',
      sublocality: location.sublocality || 'Not specified',
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius,
      interests: interestsList
    });

    let nearbyLocations: NearbyLocation[];

    try {
      nearbyLocations = await generateAIObject(prompt, {
        model: 'sonar',
        temperature: 0.4,
        maxTokens: 1200,
        schema: NearbyLocationsSchema,
      });
    } catch (error) {
      console.error('Structured response failed, falling back to text parsing:', error);

      // Fallback to text generation if structured response fails
      const textResponse = await generateAIText(prompt, {
        model: 'sonar',
        temperature: 0.4,
        maxTokens: 1200,
      });

      // Create a single item with the text response
      nearbyLocations = [{
        name: `Nearby locations for ${location.name}`,
        description: textResponse,
        category: 'mixed',
        whyInteresting: 'Various interesting locations found through AI reasoning'
      }];
    }

    return {
      success: true,
      data: nearbyLocations
    };

  } catch (error) {
    console.error('Error finding nearby locations:', error);
    return {
      success: false,
      error: {
        message: 'Failed to find nearby locations. Please try again.',
        code: 'API_ERROR'
      }
    };
  }
}

/**
 * Get both location info and nearby locations in a single call
 * @param location - Detailed location information including name, city, sublocality, and coordinates
 * @param radius - Search radius for nearby locations
 * @param interests - Array of interest categories
 * @returns Promise with combined results
 */
export async function getLocationPackage(
  location: DetailedLocation,
  radius: string = '10 km',
  interests: string[] = ['tourist attractions', 'restaurants', 'museums', 'parks', 'historical sites']
): Promise<{
  locationInfo: LocationInfoResult;
  nearbyLocations: NearbyLocationsResult;
}> {
  const [locationInfo, nearbyLocations] = await Promise.all([
    getLocationInfo(location),
    findNearbyInterestingLocations(location, radius, interests)
  ]);

  return {
    locationInfo,
    nearbyLocations
  };
}
