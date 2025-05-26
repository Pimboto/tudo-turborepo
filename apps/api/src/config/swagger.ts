// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tudo Fitness API',
      version: '1.0.0',
      description: `
# Tudo Fitness Platform API

Welcome to the Tudo Fitness API! This is a comprehensive fitness studio booking platform that connects users with fitness studios and classes.

## Getting Started

### 1. Authentication
Most endpoints require authentication. You need to:
1. Register a user account using \`/api/auth/register\`
2. Use your Clerk JWT token in the Authorization header: \`Bearer YOUR_JWT_TOKEN\`

### 2. Quick Start Guide
1. **Search Studios**: Use \`/api/studios/search\` to find studios near you
2. **Browse Classes**: Get classes for a studio with \`/api/studios/{id}/classes\`
3. **Book a Session**: Create a booking with \`/api/bookings\`
4. **Manage Your Bookings**: View and manage bookings in \`/api/users/bookings\`

### 3. User Roles
- **CLIENT**: Regular users who book classes
- **PARTNER**: Studio owners who manage studios and classes
- **ADMIN**: Platform administrators

### 4. Rate Limits
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Bookings: 10 requests per minute
- Search: 60 requests per minute

Enjoy using the API! 🏋️‍♀️💪
      `,
      contact: {
        name: 'API Support',
        email: 'support@tudo.com',
        url: 'https://tudo.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL ?? 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.tudo.com',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk JWT token'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'user_123'
            },
            email: { 
              type: 'string', 
              format: 'email',
              example: 'user@example.com'
            },
            role: { 
              type: 'string', 
              enum: ['CLIENT', 'PARTNER', 'ADMIN'],
              example: 'CLIENT'
            },
            verified: { 
              type: 'boolean',
              example: true
            },
            credits: { 
              type: 'integer',
              example: 100
            },
            referralCode: { 
              type: 'string',
              example: 'TUDO123456'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            profile: { $ref: '#/components/schemas/Profile' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'profile_123'
            },
            fullName: { 
              type: 'string',
              example: 'John Doe'
            },
            phone: { 
              type: 'string',
              example: '+1234567890'
            },
            avatarUrl: { 
              type: 'string', 
              format: 'uri',
              example: 'https://example.com/avatar.jpg'
            },
            address: { 
              type: 'string',
              example: '123 Main St, City, State 12345'
            },
            preferences: {
              type: 'object',
              properties: {
                amenities: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['showers', 'parking', 'wifi']
                },
                classTypes: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['yoga', 'pilates', 'spinning']
                },
                zones: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['downtown', 'midtown']
                },
              },
            },
          },
        },
        Partner: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'partner_123'
            },
            userId: { 
              type: 'string',
              example: 'user_123'
            },
            companyName: { 
              type: 'string',
              example: 'Fitness Studios Inc.'
            },
            taxInfo: { 
              type: 'string',
              example: '12-3456789',
              nullable: true
            },
            isVerified: { 
              type: 'boolean',
              example: true
            },
            verifiedAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
              nullable: true
            },
            verifiedBy: { 
              type: 'string',
              example: 'admin_123',
              nullable: true
            },
            commissionRate: { 
              type: 'number',
              example: 0.15,
              description: 'Commission rate (0.15 = 15%)'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        PartnerAnalytics: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalBookings: {
                  type: 'integer',
                  example: 450
                },
                completedBookings: {
                  type: 'integer',
                  example: 380
                },
                cancelledBookings: {
                  type: 'integer',
                  example: 35
                },
                totalRevenue: {
                  type: 'number',
                  example: 12750.50
                },
                totalStudios: {
                  type: 'integer',
                  example: 3
                }
              }
            },
            bookingsByStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
                  },
                  _count: {
                    type: 'integer'
                  }
                }
              }
            },
            popularClasses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string'
                  },
                  _count: {
                    type: 'integer'
                  }
                }
              }
            },
            dailyStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    format: 'date'
                  },
                  bookings: {
                    type: 'integer'
                  },
                  revenue: {
                    type: 'number'
                  }
                }
              }
            }
          }
        },
        Studio: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'studio_123'
            },
            name: { 
              type: 'string',
              example: 'Zen Yoga Studio'
            },
            description: { 
              type: 'string',
              example: 'A peaceful yoga studio in the heart of the city'
            },
            address: { 
              type: 'string',
              example: '123 Main St, City, State 12345'
            },
            lat: { 
              type: 'number',
              example: 40.7128
            },
            lng: { 
              type: 'number',
              example: -74.0060
            },
            amenities: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['showers', 'parking', 'wifi', 'mats_provided']
            },
            photos: { 
              type: 'array', 
              items: { type: 'string', format: 'uri' },
              example: ['https://example.com/studio1.jpg', 'https://example.com/studio2.jpg']
            },
            rating: { 
              type: 'number',
              example: 4.5,
              minimum: 0,
              maximum: 5
            },
            totalReviews: { 
              type: 'integer',
              example: 150
            },
            isActive: { 
              type: 'boolean',
              example: true
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'class_123'
            },
            title: { 
              type: 'string',
              example: 'Morning Vinyasa Yoga'
            },
            description: { 
              type: 'string',
              example: 'A flowing yoga class perfect for starting your day'
            },
            type: { 
              type: 'string',
              example: 'yoga'
            },
            durationMinutes: { 
              type: 'integer',
              example: 60,
              minimum: 15,
              maximum: 480
            },
            maxCapacity: { 
              type: 'integer',
              example: 20,
              minimum: 1
            },
            basePrice: { 
              type: 'number',
              example: 25.00,
              minimum: 0
            },
            photos: { 
              type: 'array', 
              items: { type: 'string', format: 'uri' },
              example: ['https://example.com/class1.jpg']
            },
            amenities: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['mats_provided', 'beginner_friendly']
            },
            status: { 
              type: 'string', 
              enum: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'],
              example: 'PUBLISHED'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
          },
        },
        Session: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'session_123'
            },
            startTime: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-20T09:00:00Z'
            },
            endTime: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-20T10:00:00Z'
            },
            instructorName: { 
              type: 'string',
              example: 'Sarah Johnson'
            },
            actualCapacity: { 
              type: 'integer',
              example: 15
            },
            status: { 
              type: 'string', 
              enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
              example: 'SCHEDULED'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              example: 'booking_123'
            },
            bookingCode: { 
              type: 'string',
              example: 'ABC12345'
            },
            status: { 
              type: 'string', 
              enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
              example: 'CONFIRMED'
            },
            checkedInAt: { 
              type: 'string', 
              format: 'date-time', 
              nullable: true,
              example: '2024-01-20T08:55:00Z'
            },
            amountPaid: { 
              type: 'number',
              example: 25.00
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            session: { $ref: '#/components/schemas/Session' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean',
              example: true
            },
            data: { 
              type: 'object',
              description: 'Response data (varies by endpoint)'
            },
            message: { 
              type: 'string',
              example: 'Operation completed successfully'
            },
            pagination: {
              type: 'object',
              properties: {
                page: { 
                  type: 'integer',
                  example: 1
                },
                limit: { 
                  type: 'integer',
                  example: 20
                },
                total: { 
                  type: 'integer',
                  example: 100
                },
                totalPages: { 
                  type: 'integer',
                  example: 5
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { 
              type: 'boolean', 
              example: false 
            },
            error: { 
              type: 'string',
              example: 'Validation error'
            },
            message: { 
              type: 'string',
              example: 'The provided data is invalid'
            },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Custom CSS for better appearance
  const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #3b82f6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0 }
  `;

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss,
    customSiteTitle: 'Tudo API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Add any custom headers here
        return req;
      }
    }
  }));
  
  // Serve raw OpenAPI spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at: /api-docs');
};
