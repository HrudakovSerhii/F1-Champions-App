/**
 * Generates an array of years from min to max (inclusive)
 * @param min - Minimum year (inclusive)
 * @param max - Maximum year (inclusive)
 * @returns Array of years from min to max
 * @example generateYearRange(2020, 2023) // [2020, 2021, 2022, 2023]
 */
export function generateYearRange(min: number, max: number): number[] {
  if (min > max) {
    return [];
  }

  const years: number[] = [];
  for (let year = min; year <= max; year++) {
    years.push(year);
  }

  return years;
}

/**
 * Generates an array of year strings from min to max (inclusive)
 * @param min - Minimum year (inclusive)
 * @param max - Maximum year (inclusive)
 * @returns Array of year strings from min to max
 * @example generateYearRangeStrings(2020, 2023) // ['2020', '2021', '2022', '2023']
 */
export function generateYearRangeStrings(min: number, max: number): string[] {
  return generateYearRange(min, max).map((year) => year.toString());
}
