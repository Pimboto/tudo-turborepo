# 🏋️‍♀️ Tudo Fitness Platform

> **Una plataforma completa de reservas de fitness que conecta usuarios con estudios y clases de ejercicio con sistema de pagos integrado**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8-2D3748?style=flat&logo=prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat&logo=clerk&logoColor=white)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat&logo=stripe&logoColor=white)](https://stripe.com/)

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [🚀 Stack Tecnológico](#-stack-tecnológico)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚡ Inicio Rápido](#-inicio-rápido)
- [🔧 Configuración Detallada](#-configuración-detallada)
- [💳 Sistema de Pagos con Stripe](#-sistema-de-pagos-con-stripe)
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
- 💳 **Sistema de Pagos Integrado**: Compra de créditos con Stripe para reservar clases
- 🏢 **Portal para Partners**: Herramientas completas para que estudios gestionen sus espacios y clases
- 👑 **Panel Administrativo**: Dashboard completo para administradores de la plataforma
- 📱 **Multi-plataforma**: API REST que soporta aplicaciones web y móviles
- 🔔 **Notificaciones**: Sistema completo de notificaciones para usuarios y partners
- 📊 **Analytics**: Métricas detalladas y reportes para partners y administradores
- 🎫 **Sistema QR**: Check-in contactless con códigos QR únicos
- 🔒 **Seguridad Avanzada**: Protección de datos con encriptación y validación de firmas

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
        H[Stripe Payments]
    end
    
    subgraph "External Services"
        I[Clerk Auth Provider]
        J[Database Hosting]
        K[File Storage]
        L[Stripe Payment Processing]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> G
    D --> H
    G --> F
    E --> I
    F --> J
    H --> L
```

### 🎨 Patrón de Arquitectura

- **Monorepo Structure**: Utiliza Turborepo para gestión eficiente de múltiples aplicaciones
- **Microservices Ready**: API modular preparada para escalar a microservicios
- **Clean Architecture**: Separación clara entre capas (Controllers, Services, Repository)
- **Event-Driven**: Sistema de notificaciones basado en eventos
- **RESTful API**: Endpoints bien estructurados siguiendo convenciones REST
- **Payment Security**: Integración segura con Stripe siguiendo mejores prácticas

## 🚀 Stack Tecnológico

### Backend Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **Language**: TypeScript 5.8
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 6.8
- **Authentication**: Clerk
- **Payments**: Stripe 14.25.0

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
- **Payment Security**: Webhook signature verification

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
│   │   │   │   ├── payment.controller.ts    # 💳 Controlador de pagos
│   │   │   │   └── ...
│   │   │   ├── middleware/    # Middlewares personalizados
│   │   │   ├── routes/        # Definición de rutas
│   │   │   │   ├── payment.routes.ts        # 💳 Rutas de pagos
│   │   │   │   └── ...
│   │   │   ├── services/      # Lógica de negocio
│   │   │   │   ├── stripe.service.ts        # 💳 Servicio de Stripe
│   │   │   │   ├── payment.service.ts       # 💳 Servicio de pagos
│   │   │   │   └── ...
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

### 📂 Nuevos Módulos de Pagos

```
apps/api/src/
├── controllers/
│   └── payment.controller.ts      # Controlador de endpoints de pagos
├── services/
│   ├── stripe.service.ts          # Integración directa con Stripe API
│   └── payment.service.ts         # Lógica de negocio de pagos
├── routes/
│   └── payment.routes.ts          # Rutas de pagos con documentación Swagger
└── types/
    └── index.ts                   # Tipos TypeScript para pagos
```

## ⚡ Inicio Rápido

### 📋 Prerrequisitos

```bash
# Versiones requeridas
Node.js 18+
PostgreSQL 15+
pnpm 8+
Cuenta de Stripe (modo test)
Cuenta de Clerk
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

# Editar variables de entorno (incluye Stripe)
nano apps/api/.env
```

4. **Configurar base de datos con nuevos modelos**
```bash
# Ejecutar migraciones (incluye tablas de pagos)
cd apps/api
pnpm db:migrate

# Poblar con datos de ejemplo
pnpm db:seed

# Poblar con datos de pagos de prueba
pnpm db:seed:payments
```

5. **Configurar Stripe Webhook**
```bash
# Instalar Stripe CLI (opcional para desarrollo)
brew install stripe/stripe-cli/stripe  # macOS
# o descargar desde https://stripe.com/docs/stripe-cli

# Autenticar con Stripe
stripe login

# Reenviar webhooks a tu servidor local
stripe listen --forward-to localhost:3001/api/payments/webhook/stripe
```

6. **Iniciar desarrollo**
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

# Stripe Configuration (NUEVO)
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX

# URLs de Frontend (para CORS y redirects)
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

3. **Poblar con datos de ejemplo**
```bash
pnpm db:seed              # Datos básicos
pnpm db:seed:payments     # Datos de pagos de prueba
```

### 🔧 Configuración de Stripe

1. **Crear cuenta en Stripe.com**
2. **Obtener claves API** desde el Dashboard de Stripe
3. **Configurar webhook endpoint**:
   - URL: `http://localhost:3001/api/payments/webhook/stripe`
   - Eventos: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `payment_intent.canceled`
4. **Copiar el webhook secret** y agregarlo a las variables de entorno

### 🔧 Configuración de Clerk

1. **Crear cuenta en Clerk.com**
2. **Crear aplicación** y obtener las claves
3. **Configurar dominios autorizados** en el dashboard de Clerk
4. **Configurar webhooks** para sincronización de usuarios

## 💳 Sistema de Pagos con Stripe

### 🌟 Características del Sistema de Pagos

- ✅ **Compra de Créditos**: Los usuarios pueden comprar créditos para reservar clases
- ✅ **Checkout Seguro**: Integración con Stripe Checkout para pagos seguros
- ✅ **Webhooks**: Procesamiento automático de eventos de pago
- ✅ **Historial de Compras**: Seguimiento completo de transacciones
- ✅ **Múltiples Paquetes**: Diferentes opciones de compra con descuentos
- ✅ **Reembolsos**: Sistema de reembolsos automáticos
- ✅ **Notificaciones**: Alertas automáticas de pagos exitosos/fallidos
- ✅ **Testing**: Herramientas de simulación para desarrollo

### 💰 Paquetes de Créditos

| Paquete | Créditos | Precio | Precio/Crédito | Descuento |
|---------|----------|--------|----------------|-----------|
| Basic | 10 | $10.00 | $1.00 | - |
| Standard | 50 | $45.00 | $0.90 | 10% |
| Premium | 100 | $80.00 | $0.80 | 20% |
| Ultimate | 250 | $175.00 | $0.70 | 30% |

### 🔄 Flujo de Compra

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API
    participant S as Stripe
    participant DB as Database
    
    U->>API: 1. Solicitar compra de créditos
    API->>DB: 2. Crear Purchase (PENDING)
    API->>S: 3. Crear Stripe Checkout Session
    S->>API: 4. URL de checkout
    API->>U: 5. Redirigir a Stripe
    U->>S: 6. Completar pago
    S->>API: 7. Webhook: checkout.session.completed
    API->>DB: 8. Actualizar Purchase (COMPLETED)
    API->>DB: 9. Incrementar créditos del usuario
    API->>DB: 10. Crear notificación
    API->>U: 11. Redirección a página de éxito
```

### 🛡️ Seguridad de Pagos

- **Verificación de Firmas**: Todos los webhooks verifican la firma de Stripe
- **Idempotencia**: Protección contra procesamiento duplicado de eventos
- **Validación de Datos**: Validación estricta de montos y metadatos
- **Transacciones Atómicas**: Operaciones de base de datos transaccionales
- **Logs de Auditoría**: Registro completo de todas las transacciones

### 📊 Endpoints de Pagos

```
GET    /api/payments/packages           # Paquetes de créditos disponibles
POST   /api/payments/checkout-session   # Crear sesión de pago
GET    /api/payments/credits            # Créditos actuales del usuario
GET    /api/payments/history            # Historial de compras
GET    /api/payments/stats              # Estadísticas de compras
GET    /api/payments/purchases/:id      # Detalles de compra específica
GET    /api/payments/verify-session/:sessionId  # Verificar sesión de pago
GET    /api/payments/success            # Información de pago exitoso
POST   /api/payments/simulate           # Simular compra (solo desarrollo)
POST   /api/payments/webhook/stripe     # Webhook de Stripe (público)
```

### 🧪 Testing de Pagos

```bash
# Simular compra para desarrollo
curl -X POST \
     -H "Authorization: Bearer JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"credits": 25}' \
     http://localhost:3001/api/payments/simulate

# Crear sesión de checkout real
curl -X POST \
     -H "Authorization: Bearer JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"credits": 50}' \
     http://localhost:3001/api/payments/checkout-session

# Verificar historial de compras
curl -H "Authorization: Bearer JWT_TOKEN" \
     http://localhost:3001/api/payments/history
```

### 🎯 Tarjetas de Prueba de Stripe

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| Visa | 4242 4242 4242 4242 | Éxito |
| Visa (declined) | 4000 0000 0000 0002 | Declined |
| Mastercard | 5555 5555 5555 4444 | Éxito |
| American Express | 3782 822463 10005 | Éxito |

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
  credits       Int       @default(0)  // 💳 Créditos para reservas
  
  // Nuevas relaciones de pagos
  purchases     Purchase[]
  paymentIntents PaymentIntent[]
  // ... otras relaciones
}
```

#### 💳 Sistema de Pagos (NUEVO)
```prisma
model Purchase {
  id              String    @id @default(cuid())
  userId          String
  amount          Float     // Monto en dólares
  credits         Int       // Créditos comprados
  stripeSessionId String    @unique
  status          PurchaseStatus @default(PENDING)
  metadata        Json      @default("{}")
  
  user            User      @relation(fields: [userId], references: [id])
}

model StripeWebhookEvent {
  id                String    @id @default(cuid())
  stripeEventId     String    @unique
  eventType         String
  processed         Boolean   @default(false)
  data              Json
  processingError   String?
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
  // ... otros campos
}

model Studio {
  id             String    @id @default(cuid())
  partnerId      String
  name           String
  address        String
  lat            Float
  lng            Float
  amenities      Json      @default("[]")
  // ... otros campos
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
  // ... otros campos
}

model Session {
  id              String    @id @default(cuid())
  classId         String
  startTime       DateTime
  endTime         DateTime
  instructorName  String
  status          SessionStatus @default(SCHEDULED)
  // ... otros campos
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
  // ... otros campos
}
```

### 📈 Comandos de Base de Datos

```bash
# Desarrollo
pnpm db:generate    # Generar cliente Prisma
pnpm db:push        # Sincronizar esquema (desarrollo)
pnpm db:migrate     # Crear migración (producción)
pnpm db:seed        # Poblar con datos básicos
pnpm db:seed:payments  # Poblar con datos de pagos
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

// Endpoints de pagos (requieren autenticación)
app.use('/api/payments', requireAuth(), attachUserData);
```

### 🔄 Flujo de Autenticación

1. **Frontend** envía credenciales a Clerk
2. **Clerk** valida y retorna JWT token
3. **API** valida token con Clerk
4. **Middleware** extrae información del usuario
5. **Base de datos** sincroniza información del usuario

## 👥 Roles y Permisos

### 🎭 Tipos de Usuario

| Rol | Descripción | Permisos | Pagos |
|-----|-------------|----------|-------|
| **CLIENT** | Usuario final que reserva clases | ✅ Buscar estudios<br>✅ Reservar clases<br>✅ Ver historial<br>✅ Gestionar perfil | ✅ Comprar créditos<br>✅ Ver historial de pagos<br>✅ Gestionar métodos de pago |
| **PARTNER** | Propietario de estudio | ✅ Gestionar estudios<br>✅ Crear clases<br>✅ Ver bookings<br>✅ Analytics<br>✅ Check-in usuarios | ✅ Ver ingresos<br>✅ Reportes de comisiones<br>✅ Analytics de pagos |
| **ADMIN** | Administrador de plataforma | ✅ Todo lo anterior<br>✅ Verificar partners<br>✅ Métricas globales<br>✅ Gestión de usuarios | ✅ Reportes financieros<br>✅ Gestión de reembolsos<br>✅ Analytics de ingresos |

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

#### 💳 Pagos (NUEVO)
```
GET    /api/payments/packages           # Paquetes de créditos disponibles
POST   /api/payments/checkout-session   # Crear sesión de pago
GET    /api/payments/credits            # Créditos actuales del usuario
GET    /api/payments/history            # Historial de compras
GET    /api/payments/stats              # Estadísticas de compras
GET    /api/payments/purchases/:id      # Detalles de compra específica
GET    /api/payments/verify-session/:sessionId  # Verificar sesión de pago
GET    /api/payments/success            # Información de pago exitoso
POST   /api/payments/simulate           # Simular compra (solo desarrollo)
POST   /api/payments/webhook/stripe     # Webhook de Stripe
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
| Payments | 50 requests | 1 minuto |
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

### 💳 Sistema de Compra de Créditos (NUEVO)

```typescript
// Flujo de compra de créditos
1. GET /api/payments/packages              # Ver paquetes disponibles
2. POST /api/payments/checkout-session     # Crear sesión de pago
3. [Usuario completa pago en Stripe]       # Pago externo
4. POST /api/payments/webhook/stripe       # Webhook procesa evento
5. GET /api/payments/success               # Confirmación de pago
```

**Características:**
- ✅ **Múltiples Paquetes** con descuentos por volumen
- ✅ **Pagos Seguros** con Stripe Checkout
- ✅ **Procesamiento Automático** vía webhooks
- ✅ **Historial Completo** de transacciones
- ✅ **Notificaciones** de pagos exitosos/fallidos
- ✅ **Simulación** para desarrollo y testing

### 🎫 Sistema de Reservas

```typescript
// Flujo de reserva
1. GET /api/bookings/available-sessions    # Buscar sesiones disponibles
2. POST /api/bookings                      # Crear reserva (usa créditos)
3. GET /api/bookings/{id}/qr              # Obtener código QR
4. PUT /api/bookings/{id}/check-in        # Check-in en el estudio
```

**Características:**
- ✅ **Validación de capacidad** en tiempo real
- ✅ **Códigos QR únicos** para cada reserva
- ✅ **Política de cancelación** configurable
- ✅ **Notificaciones automáticas**
- ✅ **Sistema de créditos** integrado con pagos

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
- 💳 **Reportes de ingresos** y comisiones de Stripe

### 👑 Panel Administrativo

**Métricas del Sistema:**
- 📈 **KPIs principales**: usuarios, partners, estudios, ingresos
- 📊 **Gráficos temporales** de crecimiento
- 🏆 **Top performers**: estudios y clases más populares
- 💰 **Reportes financieros** detallados con datos de Stripe

**Gestión de Partners:**
- ✅ **Verificación de partners** con documentación
- 🚫 **Suspensión de cuentas** cuando sea necesario
- 📊 **Monitoreo de calidad** del servicio

## 📊 Sistema de Métricas

### 📈 Métricas Automáticas

El sistema recolecta métricas diariamente con un cron job:

```typescript
// Métricas diarias recolectadas (ACTUALIZADO)
- Total de usuarios (CLIENTs)
- Total de partners
- Estudios activos
- Bookings del día
- Ingresos del día (incluye datos de Stripe)
- Usuarios activos (últimos 30 días)
- Compras completadas del día
- Créditos vendidos del día
- Tasa de conversión de pagos
```

### 📊 Endpoints de Métricas

```bash
GET /api/admin/metrics           # Métricas históricas
GET /api/admin/dashboard         # Dashboard overview
GET /api/admin/reports/revenue   # Reportes de ingresos (incluye Stripe)
GET /api/payments/stats          # Estadísticas de pagos por usuario
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

### 👤 Flujo de Usuario (CLIENT) - Actualizado con Pagos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as API
    participant C as Clerk
    participant S as Stripe
    participant DB as Database
    
    U->>C: 1. Registro/Login
    C->>A: 2. JWT Token
    A->>DB: 3. Crear/Sync Usuario
    U->>A: 4. Comprar Créditos
    A->>S: 5. Crear Stripe Session
    U->>S: 6. Completar Pago
    S->>A: 7. Webhook evento
    A->>DB: 8. Actualizar créditos
    U->>A: 9. Buscar Estudios
    A->>DB: 10. Query con filtros
    U->>A: 11. Reservar Clase (usa créditos)
    A->>DB: 12. Crear Booking
    A->>U: 13. Código QR
    U->>A: 14. Check-in
    A->>DB: 15. Actualizar Status
```

### 🏢 Flujo de Partner - Actualizado con Ingresos

```mermaid
sequenceDiagram
    participant P as Partner
    participant A as API
    participant AD as Admin
    participant S as Stripe
    participant DB as Database
    
    P->>A: 1. Registro como Partner
    A->>DB: 2. Crear Partner (no verificado)
    A->>AD: 3. Notificación de verificación
    AD->>A: 4. Aprobar Partner
    P->>A: 5. Crear Estudio
    P->>A: 6. Crear Clases
    P->>A: 7. Ver Analytics e Ingresos
    A->>DB: 8. Métricas y ganancias
    A->>S: 9. Datos de transacciones
```

### 💳 Flujo de Pagos (NUEVO)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as API
    participant S as Stripe
    participant DB as Database
    
    U->>A: 1. Solicitar compra créditos
    A->>DB: 2. Crear Purchase (PENDING)
    A->>S: 3. Crear Checkout Session
    S->>A: 4. URL de checkout
    A->>U: 5. Redirigir a Stripe
    U->>S: 6. Completar pago
    S->>A: 7. Webhook: session.completed
    A->>DB: 8. Purchase → COMPLETED
    A->>DB: 9. Incrementar créditos
    A->>DB: 10. Crear notificación
    A->>U: 11. Página de éxito
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
pnpm test:payments  # Tests de pagos específicos

# Coverage
pnpm test:coverage
```

### 🧪 Testing de Pagos (NUEVO)

```bash
# Simular compras para testing
curl -X POST \
     -H "Authorization: Bearer JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"credits": 10}' \
     http://localhost:3001/api/payments/simulate

# Testear webhooks de Stripe
stripe trigger checkout.session.completed

# Verificar procesamiento de pagos
pnpm db:studio  # Revisar tablas Purchase y StripeWebhookEvent
```

### 📋 Estructura de Tests

```
apps/api/src/
├── __tests__/
│   ├── controllers/    # Tests de controladores
│   │   └── payment.controller.test.ts  # 💳 Tests de pagos
│   ├── services/      # Tests de servicios
│   │   ├── stripe.service.test.ts      # 💳 Tests de Stripe
│   │   └── payment.service.test.ts     # 💳 Tests de pagos
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

# Clerk Live Keys
CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX

# Stripe Live Keys (NUEVO)
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_live_XXXXXXXXXXXXXXXXXXXX

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
      - run: pnpm test:payments  # Test pagos específicamente
      - run: pnpm build
      - run: pnpm db:deploy      # Migraciones en producción
```

### 📊 Health Checks

```typescript
// Endpoints de salud (ACTUALIZADO)
GET /health                 # Salud básica
GET /health/detailed        # Salud detallada con dependencias
GET /metrics               # Métricas del servidor

// Nuevos checks incluyen:
- Conexión a Stripe API
- Estado de webhooks
- Últimas transacciones procesadas
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
pnpm db:seed          # Poblar con datos básicos
pnpm db:seed:payments # Poblar con datos de pagos (NUEVO)
pnpm db:studio        # Abrir Prisma Studio

# Pagos y Stripe (NUEVO)
pnpm stripe:listen    # Escuchar webhooks localmente
pnpm stripe:trigger   # Generar eventos de prueba

# Calidad de código
pnpm lint             # Linting con ESLint
pnpm format          # Formateo con Prettier
pnpm check-types     # Verificación de tipos
pnpm test            # Ejecutar tests
pnpm test:payments   # Tests específicos de pagos
```

### 🏗️ Arquitectura de Código

```typescript
// Estructura de un controlador de pagos
export class PaymentController {
  static async createCheckoutSession(req: AuthenticatedRequest, res: Response) {
    // 1. Validación de entrada (middleware)
    // 2. Lógica de negocio (service)
    // 3. Integración con Stripe
    // 4. Respuesta estandarizada
    const session = await PaymentService.createCheckoutSession(userId, data);
    res.json(successResponse(session, 'Checkout session created'));
  }
}

// Estructura de un servicio de pagos
export class PaymentService {
  static async createCheckoutSession(userId: string, data: CreateCheckoutSessionDto) {
    // 1. Validación de usuario y créditos
    // 2. Creación de registro en BD (PENDING)
    // 3. Integración con Stripe API
    // 4. Retorno de datos de sesión
  }
}

// Estructura del servicio de Stripe
export class StripeService {
  static async createCheckoutSession(userId: string, credits: number) {
    // 1. Configuración de línea de productos
    // 2. Creación de sesión con Stripe
    // 3. Configuración de URLs y metadata
    // 4. Retorno de sesión completa
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
- ✅ **Payments**: Validación de firmas para webhooks
- ✅ **Security**: Nunca exponer claves de Stripe en logs

### 🔄 Flujo de Desarrollo

1. **Feature Branch**: `git checkout -b feature/stripe-integration`
2. **Desarrollo**: Escribir código + tests
3. **Testing**: `pnpm test` y `pnpm test:payments`
4. **Stripe Testing**: Probar con webhooks y tarjetas de prueba
5. **Commit**: Mensajes descriptivos
6. **Pull Request**: Review de código
7. **Merge**: A `main` después de aprobación

## 🤝 Contribución

### 📋 Guías de Contribución

1. **Fork** del repositorio
2. **Clone** tu fork localmente
3. **Crear branch** para tu feature
4. **Desarrollar** siguiendo las convenciones
5. **Testear** tu código (incluir tests de pagos si aplica)
6. **Crear Pull Request** con descripción detallada

### 🐛 Reportar Bugs

Usar el template de issues con:
- **Descripción** del problema
- **Pasos** para reproducir
- **Comportamiento esperado** vs actual
- **Screenshots** si aplica
- **Información del entorno**
- **Logs de Stripe** si es relacionado con pagos

### ✨ Solicitar Features

Crear issue con:
- **Descripción** de la funcionalidad
- **Justificación** del valor que aporta
- **Casos de uso** específicos
- **Mockups** o diagramas si aplica
- **Consideraciones de pagos** si aplica

### 📚 Documentación

- **API Changes**: Actualizar Swagger comments
- **Database Changes**: Documentar migraciones
- **Payment Changes**: Actualizar docs de Stripe
- **README**: Mantener actualizado
- **Changelog**: Registrar cambios importantes

## 🔧 Comandos Útiles

### 💳 Stripe Development

```bash
# Configurar Stripe CLI
stripe login

# Escuchar webhooks localmente
stripe listen --forward-to localhost:3001/api/payments/webhook/stripe

# Generar eventos de prueba
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed

# Ver eventos en dashboard
stripe events list --limit 10

# Reenviar evento específico
stripe events resend evt_XXXXXXXXX
```

### 🗄️ Base de Datos

```bash
# Generar migración para cambios de pagos
pnpm db:migrate --name add_stripe_payments

# Verificar datos de pagos
psql $DATABASE_URL -c "SELECT status, COUNT(*) FROM \"Purchase\" GROUP BY status;"

# Verificar créditos de usuarios
psql $DATABASE_URL -c "SELECT email, credits FROM \"User\" WHERE credits > 0;"
```

### 🧪 Testing y Debug

```bash
# Tests completos incluyendo pagos
pnpm test

# Tests solo de pagos
pnpm test:payments

# Debug webhook processing
tail -f logs/combined.log | grep "Stripe webhook"

# Ver métricas en tiempo real
curl http://localhost:3001/metrics | jq
```

---

## 📞 Soporte y Contacto

- **Email**: support@tudo.com
- **Documentation**: http://localhost:3001/api-docs
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Stripe Docs**: https://stripe.com/docs
- **Clerk Docs**: https://clerk.com/docs

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 🎉 Changelog

### v1.2.0 - Sistema de Pagos con Stripe
- ✅ **Integración completa con Stripe** para compra de créditos
- ✅ **Webhooks seguros** con verificación de firmas
- ✅ **Múltiples paquetes de créditos** con descuentos
- ✅ **Historial de transacciones** completo
- ✅ **Sistema de notificaciones** para pagos
- ✅ **Herramientas de testing** y simulación
- ✅ **Dashboard de métricas** actualizado con datos financieros
- ✅ **Documentación completa** con Swagger
- ✅ **Tests automatizados** para flujos de pago

### v1.1.0 - Base Platform
- ✅ Autenticación con Clerk
- ✅ Sistema de reservas
- ✅ Gestión de estudios y clases
- ✅ Panel administrativo
- ✅ Sistema de métricas

---

**¡Gracias por contribuir a Tudo Fitness! 🏋️‍♀️💪💳**

> Desarrollado con ❤️ para la comunidad fitness, ahora con pagos seguros integrados