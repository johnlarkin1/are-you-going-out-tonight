export const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami',
  'London', 'Paris', 'Berlin', 'Tokyo', 'Sydney',
  'Toronto', 'Austin', 'Nashville', 'Denver', 'Atlanta',
  'Las Vegas', 'New Orleans', 'Seattle', 'Portland', 'Boston',
];

const CITY_ABBRS: Record<string, string> = {
  'New York': 'NYC',
  'Los Angeles': 'LA',
  'Chicago': 'CHI',
  'Houston': 'HOU',
  'Miami': 'MIA',
  'London': 'LDN',
  'Paris': 'PAR',
  'Berlin': 'BER',
  'Tokyo': 'TYO',
  'Sydney': 'SYD',
  'Toronto': 'TOR',
  'Austin': 'ATX',
  'Nashville': 'NSH',
  'Denver': 'DEN',
  'Atlanta': 'ATL',
  'Las Vegas': 'LAS',
  'New Orleans': 'NOLA',
  'Seattle': 'SEA',
  'Portland': 'PDX',
  'Boston': 'BOS',
};

export const getCityAbbr = (city: string): string => {
  return CITY_ABBRS[city] || city.slice(0, 3).toUpperCase();
};

export const normalizeCity = (city: string): string => {
  return city.trim().toLowerCase();
};
