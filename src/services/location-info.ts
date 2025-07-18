import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

const perplexity = createPerplexity({
  apiKey: import.meta.env.PERPLEXITY_API_KEY,
});

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

/**
 * Get comprehensive information about a location using Perplexity Sonar Pro
 * @param location - Location name (e.g., "New York City" or "Paris, France")
 * @returns Promise with location information or error
 */
export async function getLocationInfo(location: string): Promise<LocationInfoResult> {
  try {
    if (!location || location.trim() === '') {
      return {
        success: false,
        error: {
          message: 'Location name is required.',
          code: 'INVALID_INPUT'
        }
      };
    }

    const prompt = `Provide comprehensive information about ${location}. Include:
    - Brief description and overview
    - Historical significance
    - Cultural aspects and local traditions
    - Main attractions and landmarks
    - Demographics and population
    - Economic characteristics
    - Climate and geography

    Please provide detailed, factual information that would be useful for someone planning to visit or learn about this location.`;

    const result = await generateText({
      model: perplexity('sonar-pro'),
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 1000,
    });

    // Parse the response to extract structured information
    const content = result.text;

    // Extract structured data from the response
    const locationInfo: LocationInfo = {
      name: location,
      description: content,
      // You can add more sophisticated parsing here if needed
    };

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
 * @param location - Base location name (e.g., "New York City" or "Paris, France")
 * @param radius - Search radius (optional, defaults to "10 km")
 * @param interests - Array of interest categories (optional)
 * @returns Promise with nearby locations or error
 */
export async function findNearbyInterestingLocations(
  location: string,
  radius: string = '10 km',
  interests: string[] = ['tourist attractions', 'restaurants', 'museums', 'parks', 'historical sites']
): Promise<NearbyLocationsResult> {
  try {
    if (!location || location.trim() === '') {
      return {
        success: false,
        error: {
          message: 'Location name is required.',
          code: 'INVALID_INPUT'
        }
      };
    }

    const interestsList = interests.join(', ');
    const prompt = `Find interesting locations near ${location} within ${radius}. Focus on: ${interestsList}.

    For each location, provide:
    - Name of the place
    - Brief description
    - Category (restaurant, museum, park, etc.)
    - Approximate distance from ${location}
    - Why it's interesting or worth visiting
    - Any ratings or notable features

    Please provide at least 5-10 diverse recommendations that would appeal to different types of visitors.`;

    const result = await generateText({
      model: perplexity('sonar-reasoning'),
      prompt: prompt,
      temperature: 0.4,
      maxTokens: 1200,
    });

    // Parse the response to extract nearby locations
    const content = result.text;

    // For now, return the raw content as description
    // You can add more sophisticated parsing here to extract structured data
    const nearbyLocations: NearbyLocation[] = [{
      name: `Nearby locations for ${location}`,
      description: content,
      category: 'mixed',
      whyInteresting: 'Various interesting locations found through AI reasoning'
    }];

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
 * @param location - Location name
 * @param radius - Search radius for nearby locations
 * @param interests - Array of interest categories
 * @returns Promise with combined results
 */
export async function getLocationPackage(
  location: string,
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
