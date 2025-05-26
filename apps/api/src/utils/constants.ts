// src/utils/constants.ts
export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Commission
  DEFAULT_COMMISSION_RATE: 0.15,
  
  // Credits
  REFERRAL_CREDITS: 50,
  
  // Session
  MIN_SESSION_DURATION: 15, // minutes
  MAX_SESSION_DURATION: 480, // 8 hours
  
  // Booking
  MIN_BOOKING_ADVANCE: 0, // Can book immediately
  MAX_BOOKING_ADVANCE: 30, // days
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Amenities
  AMENITIES: [
    'showers',
    'lockers',
    'parking',
    'wifi',
    'changing_rooms',
    'towels',
    'water_fountain',
    'air_conditioning',
    'music',
    'mats_provided',
    'equipment_provided',
    'juice_bar',
    'sauna',
    'pool',
    'personal_training',
    'beginner_friendly',
    'advanced_level',
    'wheelchair_accessible',
  ],
  
  // Class types
  CLASS_TYPES: [
    'yoga',
    'pilates',
    'spinning',
    'crossfit',
    'boxing',
    'dance',
    'martial_arts',
    'swimming',
    'running',
    'strength_training',
    'hiit',
    'meditation',
    'stretching',
    'barre',
    'cycling',
    'bootcamp',
    'zumba',
    'kickboxing',
    'functional_training',
  ],
} as const;
