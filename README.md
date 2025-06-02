# 🏋️‍♀️ Tudo Fitness Platform

> **Una plataforma completa de reservas de fitness que conecta usuarios con estudios y clases de ejercicio**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8-2D3748?style=flat&logo=prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat&logo=clerk&logoColor=white)](https://clerk.com/)

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [🚀 Stack Tecnológico](#-stack-tecnológico)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚡ Inicio Rápido](#-inicio-rápido)
- [🔧 Configuración Detallada](#-configuración-detallada)
- [🗄️ Base de Datos](#️-base-de-datos)
- [🔐 Autenticación y Autorización](#-autenticación-y-autorización)
- [👥 Roles y Permisos](#-roles-y-permisos)
- [📚 Documentación de la API](#-documentación-de-la-api)
- [🎯 Funcionalidades Principales](#-funcionalidades-principales)
- [📊 Sistema de Métricas](#-sistema-de-métricas)
- [🔄 Flujos de Trabajo](#-flujos-de-trabajo)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🛠️ Desarrollo](#️-desarrollo)
- [🤝 Contribución](#-contribución)

## 🎯 Descripción del Proyecto

**Tudo Fitness** es una plataforma integral que revoluciona la manera en que las personas descubren y reservan clases de fitness. Conecta a usuarios con una amplia red de estudios de ejercicio, facilitando la reserva de clases, gestión de membresías y creando una comunidad fitness vibrante.

### ✨ Características Principales

- 🔍 **Búsqueda Inteligente**: Encuentra estudios por ubicación, tipo de clase, amenidades y precio
- 📅 **Reservas en Tiempo Real**: Sistema de booking instantáneo con disponibilidad en vivo
- 🏢 **Portal para Partners**: Herramientas completas para que estudios gestionen sus espacios y clases
- 👑 **Panel Administrativo**: Dashboard completo para administradores de la plataforma
- 📱 **Multi-plataforma**: API REST que soporta aplicaciones web y móviles
- 🔔 **Notificaciones**: Sistema completo de notificaciones para usuarios y partners
- 📊 **Analytics**: Métricas detalladas y reportes para partners y administradores
- 🎫 **Sistema QR**: Check-in contactless con códigos QR únicos

## 🏗️ Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend Applications"
        A[Admin Dashboard - Vite]
        B[Blog - Remix]
        C[Storefront - Next.js]
    end
    
    subgraph "Backend Services"
        D[Express API Server]
        E[Clerk Authentication]
        F[PostgreSQL Database]
        G[Prisma ORM]
    end
    
    subgraph "External Services"
        H[Clerk Auth Provider]
        I[Database Hosting]
        J[File Storage]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> G
    G --> F
    E --> H
    F --> I
```

### 🎨 Patrón de Arquitectura

- **Monorepo Structure**: Utiliza Turborepo para gestión eficiente de múltiples aplicaciones
- **Microservices Ready**: API modular preparada para escalar a microservicios
- **Clean Architecture**: Separación clara entre capas (Controllers, Services, Repository)
- **Event-Driven**: Sistema de notificaciones basado en eventos
- **RESTful API**: Endpoints bien estructurados siguiendo convenciones REST

## 🚀 Stack Tecnológico

### Backend Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **Language**: TypeScript 5.8
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 6.8
- **Authentication**: Clerk

### Herramientas de Desarrollo
- **Package Manager**: pnpm
- **Monorepo**: Turborepo 2.5
- **Linting**: ESLint 9.27
- **Testing**: Jest 29.7
- **Documentation**: Swagger/OpenAPI 3.0

### Seguridad y Middleware
- **Security**: Helmet
- **Rate Limiting**: Express Rate Limit
- **CORS**: Configuración multi-domain
- **Validation**: Zod schemas
- **Logging**: Winston + Express Winston

### DevOps y Monitoring
- **Process Management**: PM2 ready
- **Metrics**: Sistema de métricas personalizado
- **Health Checks**: Endpoints de salud detallados
- **Error Handling**: Manejo centralizado de errores

## 📁 Estructura del Proyecto

```
kitchen-sink/
├── apps/
│   ├── admin/                 # Dashboard administrativo (Vite + React)
│   ├── api/                   # Backend API principal
│   │   ├── src/
│   │   │   ├── app.ts        # Configuración principal de Express
│   │   │   ├── controllers/   # Controladores de rutas
│   │   │   ├── middleware/    # Middlewares personalizados
│   │   │   ├── routes/        # Definición de rutas
│   │   │   ├── services/      # Lógica de negocio
│   │   │   ├── prisma/        # Esquema y cliente de Prisma
│   │   │   ├── types/         # Definiciones de tipos TypeScript
│   │   │   └── utils/         # Utilidades y helpers
│   │   ├── docs.md           # Documentación de la API
│   │   └── package.json
│   ├── blog/                 # Blog público (Remix)
│   └── storefront/           # Frontend principal (Next.js)
├── packages/
│   ├── config-eslint/        # Configuraciones de ESLint
│   ├── config-typescript/    # Configuraciones de TypeScript
│   ├── jest-presets/         # Presets de Jest
│   ├── logger/               # Utilidad de logging
│   └── ui/                   # Componentes UI compartidos
├── package.json
├── turbo.json               # Configuración de Turborepo
└── pnpm-workspace.yaml     # Configuración del workspace
```

### 📂 Estructura de la API

```
apps/api/src/
├── app.ts                   # Configuración de Express y middlewares
├── index.ts                 # Punto de entrada del servidor
├── controllers/             # Controladores por módulo
│   ├── auth.controller.ts   # Autenticación y registro
│   ├── user.controller.ts   # Gestión de usuarios
│   ├── partner.controller.ts # Gestión de partners
│   ├── studio.controller.ts # Gestión de estudios
│   ├── class.controller.ts  # Gestión de clases
│   ├── booking.controller.ts # Sistema de reservas
│   └── admin.controller.ts  # Funciones administrativas
├── services/                # Lógica de negocio
│   ├── user.service.ts
│   ├── partner.service.ts
│   ├── studio.service.ts
│   ├── class.service.ts
│   ├── booking.service.ts
│   ├── admin.service.ts
│   └── metrics.service.ts
├── middleware/              # Middlewares personalizados
│   ├── auth.ts             # Autenticación y autorización
│   ├── validation.ts       # Validación con Zod
│   ├── errorHandler.ts     # Manejo de errores
│   ├── security.ts         # Configuración de seguridad
│   ├── logging.ts          # Logging de requests
│   └── monitoring.ts       # Métricas y monitoreo
├── routes/                 # Definición de rutas
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── partner.routes.ts
│   ├── studio.routes.ts
│   ├── class.routes.ts
│   ├── booking.routes.ts
│   ├── admin.routes.ts
│   └── index.ts
├── prisma/                 # Base de datos
│   ├── schema.prisma       # Esquema de la base de datos
│   ├── client.ts          # Cliente de Prisma
│   └── seed.ts            # Datos de ejemplo
├── config/                 # Configuraciones
│   └── swagger.ts         # Configuración de Swagger
├── types/                  # Definiciones de tipos
│   └── index.ts
└── utils/                  # Utilidades
    ├── helpers.ts         # Funciones auxiliares
    └── constants.ts       # Constantes del sistema
```

## ⚡ Inicio Rápido

### 📋 Prerrequisitos

```bash
# Versiones requeridas
Node.js 18+
PostgreSQL 15+
pnpm 8+
```

### 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/tudo-fitness.git
cd tudo-fitness
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp apps/api/.env.example apps/api/.env

# Editar variables de entorno
nano apps/api/.env
```

4. **Configurar base de datos**
```bash
# Ejecutar migraciones
cd apps/api
pnpm db:migrate

# Poblar con datos de ejemplo
pnpm db:seed
```

5. **Iniciar desarrollo**
```bash
# Desde la raíz del proyecto
pnpm dev
```

### 🌐 URLs de Desarrollo

- **API**: http://localhost:3001
- **Documentación**: http://localhost:3001/api-docs
- **Admin Dashboard**: http://localhost:3001
- **Storefront**: http://localhost:3002
- **Blog**: http://localhost:5173

## 🔧 Configuración Detallada

### 🔐 Variables de Entorno

Crea un archivo `.env` en `apps/api/` con las siguientes variables:

```bash
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/tudo"

# Servidor
PORT=3001
NODE_ENV=development

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX

# URLs de Frontend (para CORS)
CLIENT_URL=http://localhost:3000
PARTNER_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002

# Multi-domain SSO (separado por comas)
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Logging
LOG_LEVEL=info
```

### 🗄️ Configuración de Base de Datos

1. **Crear base de datos PostgreSQL**
```sql
CREATE DATABASE tudo;
CREATE USER tudo_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE tudo TO tudo_user;
```

2. **Ejecutar migraciones de Prisma**
```bash
cd apps/api
pnpm db:generate  # Generar cliente de Prisma
pnpm db:push      # Aplicar esquema a la base de datos
pnpm db:migrate   # Crear y ejecutar migraciones
```

3. **Poblar con datos de ejemplo** (Opcional)
```bash
pnpm db:seed
```

### 🔧 Configuración de Clerk

1. **Crear cuenta en Clerk.com**
2. **Crear aplicación** y obtener las claves
3. **Configurar dominios autorizados** en el dashboard de Clerk
4. **Configurar webhooks** para sincronización de usuarios:
   - Endpoint: `https://tu-api.com/api/webhooks/clerk`
   - Eventos: `user.created`, `user.updated`, `user.deleted`

## 🗄️ Base de Datos

### 📊 Esquema de la Base de Datos

El sistema utiliza **PostgreSQL** con **Prisma** como ORM. El esquema incluye las siguientes entidades principales:

#### 👤 Usuarios y Autenticación
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  clerkId       String    @unique
  role          UserRole  @default(CLIENT)
  verified      Boolean   @default(false)
  referralCode  String?   @unique
  credits       Int       @default(0)
  // Relaciones...
}
```

#### 🏢 Estudios y Partners
```prisma
model Partner {
  id              String    @id @default(cuid())
  userId          String    @unique
  companyName     String
  isVerified      Boolean   @default(false)
  commissionRate  Float     @default(0.15)
  // Relaciones...
}

model Studio {
  id             String    @id @default(cuid())
  partnerId      String
  name           String
  address        String
  lat            Float
  lng            Float
  amenities      Json      @default("[]")
  // Relaciones...
}
```

#### 🏃‍♀️ Clases y Sesiones
```prisma
model Class {
  id              String    @id @default(cuid())
  studioId        String
  title           String
  type            String
  durationMinutes Int
  maxCapacity     Int
  basePrice       Float
  status          ClassStatus @default(DRAFT)
  // Relaciones...
}

model Session {
  id              String    @id @default(cuid())
  classId         String
  startTime       DateTime
  endTime         DateTime
  instructorName  String
  status          SessionStatus @default(SCHEDULED)
  // Relaciones...
}
```

#### 🎫 Sistema de Reservas
```prisma
model Booking {
  id            String    @id @default(cuid())
  userId        String
  sessionId     String
  bookingCode   String    @unique @default(cuid())
  status        BookingStatus @default(CONFIRMED)
  amountPaid    Float     @default(0)
  checkedInAt   DateTime?
  // Relaciones...
}
```

### 📈 Comandos de Base de Datos

```bash
# Desarrollo
pnpm db:generate    # Generar cliente Prisma
pnpm db:push        # Sincronizar esquema (desarrollo)
pnpm db:migrate     # Crear migración (producción)
pnpm db:seed        # Poblar con datos de ejemplo
pnpm db:studio      # Abrir Prisma Studio

# Producción
pnpm db:deploy      # Aplicar migraciones en producción
```

## 🔐 Autenticación y Autorización

### 🔑 Sistema de Autenticación

El sistema utiliza **Clerk** para autenticación, proporcionando:

- ✅ **Registro/Login** con email y password
- ✅ **Autenticación social** (Google, GitHub, etc.)
- ✅ **Verificación de email**
- ✅ **Recuperación de contraseña**
- ✅ **Multi-factor authentication (MFA)**
- ✅ **SSO multi-dominio**

### 🛡️ Middleware de Autenticación

```typescript
// Autenticación requerida
app.use('/api/protected', requireAuth());

// Autenticación opcional
app.use('/api/public', optionalAuth);

// Autorización por roles
app.use('/api/admin', requireAuth(), authorize('ADMIN'));
app.use('/api/partner', requireAuth(), authorize('PARTNER'));
```

### 🔄 Flujo de Autenticación

1. **Frontend** envía credenciales a Clerk
2. **Clerk** valida y retorna JWT token
3. **API** valida token con Clerk
4. **Middleware** extrae información del usuario
5. **Base de datos** sincroniza información del usuario

## 👥 Roles y Permisos

### 🎭 Tipos de Usuario

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **CLIENT** | Usuario final que reserva clases | ✅ Buscar estudios<br>✅ Reservar clases<br>✅ Ver historial<br>✅ Gestionar perfil |
| **PARTNER** | Propietario de estudio | ✅ Gestionar estudios<br>✅ Crear clases<br>✅ Ver bookings<br>✅ Analytics<br>✅ Check-in usuarios |
| **ADMIN** | Administrador de plataforma | ✅ Todo lo anterior<br>✅ Verificar partners<br>✅ Métricas globales<br>✅ Gestión de usuarios |

### 🔒 Control de Acceso

```typescript
// Ejemplo de autorización granular
const studioOwnership = async (req, res, next) => {
  const { studioId } = req.params;
  const { user } = req;
  
  const studio = await prisma.studio.findFirst({
    where: { id: studioId, partnerId: user.partnerId }
  });
  
  if (!studio) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};
```

## 📚 Documentación de la API

### 🌐 Swagger/OpenAPI

La API está completamente documentada con **Swagger UI**, accesible en:
- **URL**: http://localhost:3001/api-docs
- **Especificación JSON**: http://localhost:3001/api-docs.json

### 📋 Endpoints Principales

#### 🔐 Autenticación
```
POST   /api/auth/register     # Registrar usuario
POST   /api/auth/sync        # Sincronizar con Clerk
GET    /api/auth/me          # Usuario actual
DELETE /api/auth/account     # Eliminar cuenta
```

#### 👤 Usuarios
```
GET    /api/users/profile          # Perfil del usuario
PUT    /api/users/profile          # Actualizar perfil
GET    /api/users/bookings         # Reservas del usuario
GET    /api/users/notifications    # Notificaciones
```

#### 🏢 Estudios
```
GET    /api/studios/search         # Buscar estudios
GET    /api/studios/{id}           # Detalles del estudio
GET    /api/studios/{id}/classes   # Clases del estudio
POST   /api/studios               # Crear estudio (Partner)
```

#### 🏃‍♀️ Clases y Sesiones
```
GET    /api/classes/upcoming       # Sesiones próximas
GET    /api/classes/{id}           # Detalles de clase
POST   /api/classes               # Crear clase (Partner)
POST   /api/classes/{id}/sessions # Crear sesión (Partner)
```

#### 🎫 Reservas
```
GET    /api/bookings/available-sessions  # Sesiones disponibles
POST   /api/bookings                    # Crear reserva
PUT    /api/bookings/{id}/cancel        # Cancelar reserva
PUT    /api/bookings/{id}/check-in      # Check-in
GET    /api/bookings/{id}/qr           # Código QR
```

#### 👑 Administración
```
GET    /api/admin/dashboard        # Panel administrativo
GET    /api/admin/metrics          # Métricas del sistema
GET    /api/admin/partners/pending # Partners pendientes
PUT    /api/admin/partners/{id}/verify # Verificar partner
```

### 📊 Rate Limiting

| Endpoint Type | Límite | Ventana |
|---------------|---------|----------|
| General API | 1000 requests | 15 minutos |
| Authentication | 50 requests | 15 minutos |
| Bookings | 50 requests | 1 minuto |
| Search | 100 requests | 1 minuto |

## 🎯 Funcionalidades Principales

### 🔍 Búsqueda de Estudios

```typescript
// Búsqueda con filtros avanzados
GET /api/studios/search?lat=40.7128&lng=-74.0060&radius=10&type=yoga&amenities=showers,parking
```

**Filtros Disponibles:**
- 📍 **Geolocalización**: Latitud, longitud y radio
- 🏃‍♀️ **Tipo de clase**: yoga, pilates, spinning, etc.
- 🏢 **Amenidades**: duchas, estacionamiento, wifi, etc.
- 💰 **Rango de precios**: mínimo y máximo
- 📅 **Disponibilidad**: fechas específicas

### 🎫 Sistema de Reservas

```typescript
// Flujo de reserva
1. GET /api/bookings/available-sessions    # Buscar sesiones disponibles
2. POST /api/bookings                      # Crear reserva
3. GET /api/bookings/{id}/qr              # Obtener código QR
4. PUT /api/bookings/{id}/check-in        # Check-in en el estudio
```

**Características:**
- ✅ **Validación de capacidad** en tiempo real
- ✅ **Códigos QR únicos** para cada reserva
- ✅ **Política de cancelación** configurable
- ✅ **Notificaciones automáticas**
- ✅ **Sistema de créditos** y referidos

### 🏢 Gestión de Partners

```typescript
// Flujo de partner
1. POST /api/partners/register            # Registrarse como partner
2. POST /api/partners/request-verification # Solicitar verificación
3. POST /api/studios                      # Crear estudio (requiere verificación)
4. POST /api/classes                      # Crear clases
5. GET /api/partners/analytics           # Ver métricas y ganancias
```

**Panel de Partner:**
- 📊 **Analytics completos**: bookings, ingresos, tendencias
- 💰 **Gestión de ganancias** con comisiones automáticas
- 📅 **Calendario de sesiones** con gestión de capacidad
- 👥 **Lista de asistentes** con check-in masivo
- 🔔 **Notificaciones** de nuevas reservas y cancelaciones

### 👑 Panel Administrativo

**Métricas del Sistema:**
- 📈 **KPIs principales**: usuarios, partners, estudios, ingresos
- 📊 **Gráficos temporales** de crecimiento
- 🏆 **Top performers**: estudios y clases más populares
- 💰 **Reportes financieros** detallados

**Gestión de Partners:**
- ✅ **Verificación de partners** con documentación
- 🚫 **Suspensión de cuentas** cuando sea necesario
- 📊 **Monitoreo de calidad** del servicio

## 📊 Sistema de Métricas

### 📈 Métricas Automáticas

El sistema recolecta métricas diariamente con un cron job:

```typescript
// Métricas diarias recolectadas
- Total de usuarios (CLIENTs)
- Total de partners
- Estudios activos
- Bookings del día
- Ingresos del día
- Usuarios activos (últimos 30 días)
```

### 📊 Endpoints de Métricas

```bash
GET /api/admin/metrics           # Métricas históricas
GET /api/admin/dashboard         # Dashboard overview
GET /api/admin/reports/revenue   # Reportes de ingresos
GET /metrics                     # Métricas del servidor
```

### 🔄 Configuración del Cron Job

```typescript
// Ejecuta diariamente a las 00:30
MetricsService.startMetricsCron();

// Actualización manual
MetricsService.forceUpdateMetrics();
```

## 🔄 Flujos de Trabajo

### 👤 Flujo de Usuario (CLIENT)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as API
    participant C as Clerk
    participant DB as Database
    
    U->>C: 1. Registro/Login
    C->>A: 2. JWT Token
    A->>DB: 3. Crear/Sync Usuario
    U->>A: 4. Buscar Estudios
    A->>DB: 5. Query con filtros
    U->>A: 6. Reservar Clase
    A->>DB: 7. Crear Booking
    A->>U: 8. Código QR
    U->>A: 9. Check-in
    A->>DB: 10. Actualizar Status
```

### 🏢 Flujo de Partner

```mermaid
sequenceDiagram
    participant P as Partner
    participant A as API
    participant AD as Admin
    participant DB as Database
    
    P->>A: 1. Registro como Partner
    A->>DB: 2. Crear Partner (no verificado)
    A->>AD: 3. Notificación de verificación
    AD->>A: 4. Aprobar Partner
    P->>A: 5. Crear Estudio
    P->>A: 6. Crear Clases
    P->>A: 7. Ver Analytics
    A->>DB: 8. Métricas y ganancias
```

### 👑 Flujo Administrativo

```mermaid
sequenceDiagram
    participant AD as Admin
    participant A as API
    participant DB as Database
    participant MS as MetricsService
    
    AD->>A: 1. Ver Dashboard
    A->>DB: 2. Query métricas
    AD->>A: 3. Verificar Partners
    A->>DB: 4. Update Partner Status
    MS->>DB: 5. Actualizar métricas diarias
    AD->>A: 6. Generar reportes
    A->>DB: 7. Query reportes complejos
```

## 🧪 Testing

### 🎯 Estrategia de Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests específicos
pnpm test:unit      # Tests unitarios
pnpm test:integration # Tests de integración
pnpm test:e2e       # Tests end-to-end

# Coverage
pnpm test:coverage
```

### 📋 Estructura de Tests

```
apps/api/src/
├── __tests__/
│   ├── controllers/    # Tests de controladores
│   ├── services/      # Tests de servicios
│   ├── middleware/    # Tests de middleware
│   └── utils/         # Tests de utilidades
├── tests/
│   ├── fixtures/      # Datos de prueba
│   ├── helpers/       # Helpers para tests
│   └── setup.ts       # Configuración global
```

### 🔧 Configuración de Testing

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/prisma/**',
  ],
};
```

## 🚀 Deployment

### 🐳 Docker

```dockerfile
# Dockerfile para la API
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3001
CMD ["pnpm", "start"]
```

### ☁️ Variables de Producción

```bash
# Producción
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/tudo
CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX

# URLs de producción
CLIENT_URL=https://app.tudo.com
PARTNER_URL=https://partners.tudo.com
ADMIN_URL=https://admin.tudo.com
```

### 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy API
on:
  push:
    branches: [main]
    paths: ['apps/api/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - run: pnpm db:deploy  # Migraciones en producción
```

### 📊 Health Checks

```typescript
// Endpoints de salud
GET /health                 # Salud básica
GET /health/detailed        # Salud detallada con dependencias
GET /metrics               # Métricas del servidor
```

## 🛠️ Desarrollo

### 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar en modo desarrollo
pnpm build            # Compilar para producción
pnpm start            # Iniciar servidor de producción

# Base de datos
pnpm db:generate      # Generar cliente Prisma
pnpm db:push          # Aplicar esquema (desarrollo)
pnpm db:migrate       # Crear migración
pnpm db:seed          # Poblar con datos
pnpm db:studio        # Abrir Prisma Studio

# Calidad de código
pnpm lint             # Linting con ESLint
pnpm format          # Formateo con Prettier
pnpm check-types     # Verificación de tipos
pnpm test            # Ejecutar tests
```

### 🏗️ Arquitectura de Código

```typescript
// Estructura de un controlador
export class StudioController {
  static async search(req: Request, res: Response) {
    // 1. Validación de entrada (middleware)
    // 2. Lógica de negocio (service)
    // 3. Respuesta estandarizada
    const result = await StudioService.searchStudios(filters, pagination);
    res.json(successResponse(result.studios, undefined, result.pagination));
  }
}

// Estructura de un servicio
export class StudioService {
  static async searchStudios(filters: SearchFilters, pagination: Pagination) {
    // 1. Construcción de query
    // 2. Ejecución con Prisma
    // 3. Transformación de datos
    // 4. Retorno estructurado
  }
}
```

### 📝 Convenciones de Código

- ✅ **Naming**: camelCase para variables, PascalCase para clases
- ✅ **Imports**: Orden específico (externos, internos, tipos)
- ✅ **Errors**: Usar `AppError` para errores controlados
- ✅ **Responses**: Usar `successResponse` y `errorResponse`
- ✅ **Validation**: Schemas de Zod para validación de entrada
- ✅ **Types**: Interfaces explícitas para DTOs

### 🔄 Flujo de Desarrollo

1. **Feature Branch**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollo**: Escribir código + tests
3. **Testing**: `pnpm test` y `pnpm lint`
4. **Commit**: Mensajes descriptivos
5. **Pull Request**: Review de código
6. **Merge**: A `main` después de aprobación

## 🤝 Contribución

### 📋 Guías de Contribución

1. **Fork** del repositorio
2. **Clone** tu fork localmente
3. **Crear branch** para tu feature
4. **Desarrollar** siguiendo las convenciones
5. **Testear** tu código
6. **Crear Pull Request** con descripción detallada

### 🐛 Reportar Bugs

Usar el template de issues con:
- **Descripción** del problema
- **Pasos** para reproducir
- **Comportamiento esperado** vs actual
- **Screenshots** si aplica
- **Información del entorno**

### ✨ Solicitar Features

Crear issue con:
- **Descripción** de la funcionalidad
- **Justificación** del valor que aporta
- **Casos de uso** específicos
- **Mockups** o diagramas si aplica

### 📚 Documentación

- **API Changes**: Actualizar Swagger comments
- **Database Changes**: Documentar migraciones
- **README**: Mantener actualizado
- **Changelog**: Registrar cambios importantes

---

## 📞 Soporte y Contacto

- **Email**: support@tudo.com
- **Documentation**: http://localhost:3001/api-docs
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**¡Gracias por contribuir a Tudo Fitness! 🏋️‍♀️💪**

> Desarrollado con ❤️ para la comunidad fitness