/**
 * Psychrometric calculations for moisture/humidity measurements
 * Supports both imperial (GPP) and metric (g/kg) units
 */

export type UnitSystem = 'imperial' | 'metric';

/**
 * Calculate Grains Per Pound (GPP) from temperature and relative humidity
 * Uses the Magnus formula for saturation vapor pressure
 * @param temperatureF - Temperature in Fahrenheit
 * @param relativeHumidity - Relative humidity percentage (0-100)
 * @returns GPP value rounded to 1 decimal place
 */
export function calculateGPP(temperatureF: number, relativeHumidity: number): number {
  // Convert Fahrenheit to Celsius
  const tempC = fahrenheitToCelsius(temperatureF);
  
  // Calculate saturation vapor pressure (kPa) using Magnus formula
  const saturationPressure = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  
  // Actual vapor pressure
  const actualPressure = (relativeHumidity / 100) * saturationPressure;
  
  // Atmospheric pressure at sea level (kPa)
  const Patm = 101.325;
  
  // Humidity ratio (kg water / kg dry air)
  const humidityRatio = 0.62198 * (actualPressure / (Patm - actualPressure));
  
  // Convert to grains per pound (7000 grains = 1 lb)
  const gpp = humidityRatio * 7000;
  
  return Math.round(gpp * 10) / 10;
}

/**
 * Calculate grams per kilogram from temperature (Celsius) and relative humidity
 * @param temperatureC - Temperature in Celsius
 * @param relativeHumidity - Relative humidity percentage (0-100)
 * @returns g/kg value rounded to 1 decimal place
 */
export function calculateGramsPerKg(temperatureC: number, relativeHumidity: number): number {
  const tempF = celsiusToFahrenheit(temperatureC);
  const gpp = calculateGPP(tempF, relativeHumidity);
  return gppToGramsPerKg(gpp);
}

// Unit conversions
export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5 / 9) * 10) / 10;
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

export function gppToGramsPerKg(gpp: number): number {
  // 1 GPP ≈ 0.14286 g/kg (or GPP / 7)
  return Math.round((gpp / 7) * 10) / 10;
}

export function gramsPerKgToGpp(gpk: number): number {
  // 1 g/kg ≈ 7 GPP
  return Math.round((gpk * 7) * 10) / 10;
}

/**
 * Format humidity ratio for display based on unit system
 */
export function formatHumidityRatio(gpp: number, units: UnitSystem): string {
  if (units === 'metric') {
    const gpk = gppToGramsPerKg(gpp);
    return `${gpk} g/kg`;
  }
  return `${gpp} GPP`;
}

/**
 * Get the humidity ratio label based on unit system
 */
export function getHumidityRatioLabel(units: UnitSystem): string {
  return units === 'metric' ? 'Grams per Kilogram (g/kg)' : 'Grains per Pound (GPP)';
}

/**
 * Get the humidity ratio unit abbreviation
 */
export function getHumidityRatioUnit(units: UnitSystem): string {
  return units === 'metric' ? 'g/kg' : 'GPP';
}

/**
 * Format temperature for display based on unit system
 */
export function formatTemperature(tempF: number, units: UnitSystem): string {
  if (units === 'metric') {
    return `${fahrenheitToCelsius(tempF)}°C`;
  }
  return `${tempF}°F`;
}

/**
 * Get status color based on current vs target humidity ratio
 * Returns semantic color class names
 */
export type HumidityStatus = 'success' | 'warning' | 'emergency';

export function getHumidityRatioStatus(current: number, target: number): HumidityStatus {
  if (current <= target) {
    return 'success'; // At or below target - drying complete
  }
  if (current <= target * 1.3) {
    return 'warning'; // Within 30% of target - getting close
  }
  return 'emergency'; // Still high - needs more drying
}

/**
 * Calculate progress percentage toward drying goal
 * @param current - Current GPP reading
 * @param initial - Initial GPP reading (when drying started)
 * @param target - Target GPP
 * @returns Progress percentage (0-100)
 */
export function calculateDryingProgress(current: number, initial: number, target: number): number {
  if (initial <= target) return 100; // Already at target
  const totalReduction = initial - target;
  const currentReduction = initial - current;
  const progress = (currentReduction / totalReduction) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}
