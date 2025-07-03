# 🔐 API de Autenticación - Tudo Fitness

## Endpoints de Autenticación Completos

### 1. **Registrar Usuario con Clerk**
- **Endpoint**: `POST /api/auth/register`
- **Autenticación**: No requerida
- **Descripción**: Registra un nuevo usuario después de la autenticación con Clerk
- **Body**:
```json
{
  "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "1234567890",
  "role": "CLIENT" | "PARTNER",
  "referralCode": "TUDO123456" (opcional),
  "companyName": "Fitness Studios Inc." (requerido si role es PARTNER),
  "taxInfo": "12-3456789" (requerido si role es PARTNER)
}
```
- **Respuesta exitosa** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm3xyzabc123",
      "email": "user@example.com",
      "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
      "role": "CLIENT",
      "verified": false,
      "credits": 0,
      "referralCode": "REF-ABC123",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  },
  "message": "User registered successfully"
}
```
- **Errores posibles**:
  - 400: Datos inválidos o faltantes
  - 409: Usuario ya existe con ese clerkId o email

### 2. **Completar Perfil**
- **Endpoint**: `PUT /api/auth/complete-profile`
- **Autenticación**: No requerida (pero requiere clerkId válido)
- **Descripción**: Completa el perfil del usuario después del registro inicial
- **Body**:
```json
{
  "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
  "profile": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St, City, Country",
    "avatarUrl": "https://example.com/avatar.jpg",
    "preferences": {
      "amenities": ["showers", "parking", "wifi"],
      "classTypes": ["yoga", "pilates", "spinning"],
      "zones": ["downtown", "north-zone", "beach-area"]
    }
  }
}
```
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm3xyzabc123",
      "email": "user@example.com",
      "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
      "role": "CLIENT",
      "verified": true,
      "profile": {
        "id": "prof_123",
        "fullName": "John Doe",
        "phone": "+1234567890",
        "address": "123 Main St, City, Country",
        "avatarUrl": "https://example.com/avatar.jpg",
        "preferences": {
          "amenities": ["showers", "parking", "wifi"],
          "classTypes": ["yoga", "pilates", "spinning"],
          "zones": ["downtown", "north-zone", "beach-area"]
        },
        "updatedAt": "2025-01-15T10:35:00Z"
      }
    }
  },
  "message": "Profile completed successfully"
}
```
- **Errores posibles**:
  - 404: Usuario no encontrado con ese clerkId
  - 400: Datos de perfil inválidos

### 3. **Verificar Email/Usuario**
- **Endpoint**: `POST /api/auth/verify`
- **Autenticación**: Bearer token (JWT)
- **Descripción**: Marca el usuario como verificado después de confirmar el email
- **Body**:
```json
{
  "verificationCode": "123456" (opcional, si se usa verificación por código)
}
```
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm3xyzabc123",
      "email": "user@example.com",
      "verified": true,
      "verifiedAt": "2025-01-15T10:40:00Z"
    }
  },
  "message": "User verified successfully"
}
```
- **Errores posibles**:
  - 400: Código de verificación inválido
  - 409: Usuario ya verificado

### 4. **Sincronizar con Clerk (Webhook)**
- **Endpoint**: `POST /api/auth/sync`
- **Autenticación**: Webhook secret validation o Bearer token
- **Descripción**: Sincroniza datos del usuario con Clerk (usado por webhooks o manualmente)
- **Body** (si es manual):
```json
{
  "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC"
}
```
- **Body** (si es webhook de Clerk):
```json
{
  "data": {
    "id": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
    "email_addresses": [{
      "email_address": "user@example.com"
    }],
    "first_name": "John",
    "last_name": "Doe",
    "profile_image_url": "https://img.clerk.com/..."
  },
  "type": "user.created" | "user.updated" | "user.deleted"
}
```
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm3xyzabc123",
      "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
      "email": "user@example.com",
      "syncedAt": "2025-01-15T10:45:00Z"
    }
  },
  "message": "User synced successfully"
}
```

### 5. **Obtener Usuario Actual**
- **Endpoint**: `GET /api/auth/me`
- **Autenticación**: Bearer token (JWT)
- **Descripción**: Obtiene la información completa del usuario autenticado
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "id": "cm3xyzabc123",
    "email": "user@example.com",
    "clerkId": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
    "role": "CLIENT",
    "verified": true,
    "credits": 50,
    "referralCode": "REF-ABC123",
    "profile": {
      "id": "prof_123",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St, City, Country",
      "avatarUrl": "https://example.com/avatar.jpg",
      "dateOfBirth": "1990-01-15",
      "gender": "MALE",
      "bio": "Fitness enthusiast",
      "preferences": {
        "amenities": ["showers", "parking", "wifi"],
        "classTypes": ["yoga", "pilates", "spinning"],
        "zones": ["downtown", "north-zone", "beach-area"],
        "emailNotifications": true,
        "smsNotifications": false,
        "reminderHours": 24
      }
    },
    "partner": {
      "id": "partner_123",
      "companyName": "Fitness Studios Inc.",
      "isVerified": true
    } (solo si el usuario es PARTNER),
    "stats": {
      "totalBookings": 45,
      "completedClasses": 42,
      "memberSince": "2024-01-15T00:00:00Z"
    }
  }
}
```

### 6. **Eliminar Cuenta**
- **Endpoint**: `DELETE /api/auth/account`
- **Autenticación**: Bearer token (JWT)
- **Descripción**: Elimina permanentemente la cuenta del usuario
- **Body** (opcional):
```json
{
  "reason": "No longer using the service",
  "feedback": "Additional feedback text"
}
```
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "deletedAt": "2025-01-15T10:50:00Z",
    "clerkDeleted": true
  }
}
```
- **Errores posibles**:
  - 400: Usuario tiene reservas activas
  - 403: Usuario es partner con estudios activos

### 7. **Refresh Token**
- **Endpoint**: `POST /api/auth/refresh`
- **Autenticación**: Bearer token (JWT expirado o por expirar)
- **Descripción**: Refresca el token de autenticación
- **Body**: No requerido
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "expiresIn": 3600,
    "refreshToken": "refresh_token_here"
  },
  "message": "Token refreshed successfully"
}
```

### 8. **Logout**
- **Endpoint**: `POST /api/auth/logout`
- **Autenticación**: Bearer token (JWT)
- **Descripción**: Invalida el token actual y cierra la sesión
- **Body**: No requerido
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 9. **Verificar Código de Referido**
- **Endpoint**: `GET /api/auth/referral/:code`
- **Autenticación**: No requerida
- **Descripción**: Verifica si un código de referido es válido
- **Parámetros**: `code` (string)
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "valid": true,
    "referrer": {
      "id": "cm3xyzabc123",
      "profile": {
        "fullName": "Jane Smith"
      }
    },
    "bonus": {
      "referrerCredits": 5,
      "referredCredits": 3
    }
  }
}
```
- **Errores posibles**:
  - 404: Código de referido no existe o expiró

### 10. **Cambiar Rol de Usuario (Admin)**
- **Endpoint**: `PUT /api/auth/change-role`
- **Autenticación**: Bearer token (JWT) - Rol ADMIN
- **Descripción**: Cambia el rol de un usuario
- **Body**:
```json
{
  "userId": "cm3xyzabc123",
  "newRole": "PARTNER" | "CLIENT" | "ADMIN"
}
```
- **Respuesta exitosa** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm3xyzabc123",
      "email": "user@example.com",
      "role": "PARTNER",
      "previousRole": "CLIENT",
      "roleChangedAt": "2025-01-15T11:00:00Z"
    }
  },
  "message": "User role updated successfully"
}
```

---

## 📝 Notas Importantes sobre Autenticación

### 🔐 Headers Requeridos
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### 🔄 Flujo de Autenticación Completo
1. Usuario se registra/login con Clerk
2. Frontend llama a `/api/auth/register` con clerkId
3. Usuario completa perfil con `/api/auth/complete-profile`
4. Sistema verifica email automáticamente o con `/api/auth/verify`
5. Usuario obtiene sus datos con `/api/auth/me`

### ⚠️ Códigos de Error Específicos
- **401**: Token inválido o expirado
- **403**: Sin permisos para la acción
- **404**: Usuario no encontrado
- **409**: Conflicto (usuario ya existe, ya verificado, etc.)
- **422**: Datos de entrada inválidos

### 🎯 Webhooks de Clerk
El endpoint `/api/auth/sync` también funciona como receptor de webhooks de Clerk para los eventos:
- `user.created`
- `user.updated` 
- `user.deleted`
- `session.created`
- `session.ended`

### 🔒 Seguridad
- Todos los tokens JWT expiran en 1 hora
- Los refresh tokens expiran en 7 días
- Las sesiones se invalidan al hacer logout
- Los webhooks requieren verificación de firma
