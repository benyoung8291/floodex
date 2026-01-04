interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<GeocodingResult | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}, USA`;
  const encodedAddress = encodeURIComponent(fullAddress);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'FloodEx-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data: NominatimResult[] = await response.json();

    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; city: string; state: string; zipCode: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'FloodEx-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();
    const addr = data.address;

    return {
      address: [addr.house_number, addr.road].filter(Boolean).join(' ') || '',
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      zipCode: addr.postcode || '',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
