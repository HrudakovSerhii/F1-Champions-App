export const isDevelopment = process.env.NODE_ENV !== 'production';

export const isTest = process.env.NODE_ENV === 'test';

export const SEASONS_RANGE: [number, number] = [2005, 2025];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// App routing
export const HOME = '/';
export const SEASON = '/season/:seasonId';
export const SEASONS = '/seasons';

export const ABOUT = '/about';
export const CONTACT = '/contact';

export const CONTACT_EMAIL = 'hrudakovserhii@gmail.com';
