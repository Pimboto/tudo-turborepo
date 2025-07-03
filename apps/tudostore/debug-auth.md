# 🔍 Debug Guide - TUDO Fitness Auth

## ✅ **Problemas Arreglados:**

1. **✅ Ruta OAuth corregida**: Ahora va directamente a `/sso-callback`
2. **✅ Flujo de preferencias mejorado**: Incluye sync automático para usuarios OAuth
3. **✅ Dashboard creado**: Evita 404 después del onboarding
4. **✅ Logging mejorado**: Más información en console para debugging
5. **✅ Redirects optimizados**: Tiempos de redirección más rápidos

## 🧪 **Para probar el flujo:**

### Flujo EMAIL/PASSWORD:
1. Ve a `/en/signup`
2. Selecciona CLIENT o PARTNER
3. Llena el formulario de email
4. Verifica el código de email
5. ✅ Se hace sync automático
6. ✅ Va a `/en/onboarding/preferences`
7. ✅ Llena preferencias
8. ✅ Se hace sync si es necesario
9. ✅ Va a `/en/dashboard`

### Flujo OAUTH (Google/Apple):
1. Ve a `/en/signup`
2. Selecciona CLIENT o PARTNER
3. ✅ Se guarda el rol en localStorage
4. Click en "Continue with Google/Apple"
5. ✅ Completa OAuth → va a `/en/sso-callback`
6. ✅ SSO callback → va a `/en/onboarding/preferences`
7. ✅ En preferencias se hace sync automático
8. ✅ Se limpia localStorage
9. ✅ Va a `/en/dashboard`

## 🔍 **Debug en Console:**

Ahora verás estos logs detallados:
```
🌐 API Request: {url, method, endpoint, hasToken, API_BASE_URL}
📡 API Response: {url, status, statusText, ok}
✅ API Success: {data}
❌ API Error Response: {error details}
💥 API Error: {url, error, endpoint}
```

## 🛠 **Si aún hay problemas:**

### Para el problema de API request sin ruta:
1. **Abre DevTools → Network**
2. **Busca cualquier request a `localhost:3001/`** (sin path)
3. **Ve el stack trace** para ver qué lo está causando
4. **Revisa los logs de console** para ver exactamente qué endpoint se está llamando

### Debugging adicional:
```javascript
// En la console del browser, puedes ejecutar:
console.log('Environment:', {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  current_role: localStorage.getItem('pending_user_role'),
  user_signed_in: !!window?.Clerk?.user
});
```

## 📋 **Checklist de problemas conocidos:**

- ✅ OAuth redirects arreglados
- ✅ Dashboard página creada  
- ✅ Sync automático en preferencias
- ✅ Mejor manejo de errores
- ✅ Logging detallado
- ✅ Limpieza de localStorage
- ✅ Redirects optimizados

## 🎯 **URLs importantes:**

- **Signup**: `/en/signup`
- **SSO Callback**: `/en/sso-callback`  
- **Preferences**: `/en/onboarding/preferences`
- **Dashboard**: `/en/dashboard`

## 🚀 **Flujo completo esperado:**

```
OAUTH: /signup → OAuth → /sso-callback → /onboarding/preferences → /dashboard
EMAIL: /signup → verify → /onboarding/preferences → /dashboard
```

¡Ahora prueba el flujo y revisa los logs en console! 🎉 
