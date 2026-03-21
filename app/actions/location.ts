'use server'

export async function getLocationFromCoords(lat: number, lon: number) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
            {
                headers: {
                    'User-Agent': 'FoodAi-App/1.0 (cenk@foodai.fi)', // Nominatim requires a User-Agent
                    'Accept-Language': 'fi-FI' // Prefer Finnish names
                }
            }
        )

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
            throw new Error(data.error)
        }

        const address = data.address
        const city = address.city || address.town || address.village || address.municipality || 'Tuntematon'
        const suburb = address.suburb || address.neighbourhood || ''

        return {
            success: true,
            location: `${city}${suburb ? ', ' + suburb : ''}`,
            city: city
        }

    } catch (error: any) {
        console.error('Server Geocoding Error:', error.message)
        return {
            success: false,
            error: error.message
        }
    }
}
