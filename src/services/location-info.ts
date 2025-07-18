import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

const perplexity = createPerplexity({
  apiKey: import.meta.env.PERPLEXITY_API_KEY,
});

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
      name: location.name,
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

/**
 * Read a prompt template from a text file
 * @param filename - Name of the prompt file (e.g., 'about.txt')
 * @returns Promise with the prompt content
 */
async function readPromptTemplate(filename: string): Promise<string> {
  try {
    const response = await fetch(`/assets/prompts/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt file: ${filename}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error reading prompt file ${filename}:`, error);
    throw error;
  }
}

/**
 * Replace placeholders in a prompt template
 * @param template - The prompt template with placeholders
 * @param replacements - Object with placeholder values
 * @returns The processed prompt
 */
function processPromptTemplate(template: string, replacements: Record<string, string>): string {
  let processedPrompt = template;
  Object.entries(replacements).forEach(([key, value]) => {
    processedPrompt = processedPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return processedPrompt;
}
