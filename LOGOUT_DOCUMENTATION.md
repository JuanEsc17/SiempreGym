# Sistema de Logout - SiempreGym

## Resumen de Cambios Implementados

He creado un sistema de logout robusto y bien estructurado para tu aplicación SiempreGym. Aquí está lo que se implementó:

---

## 1. **Backend (Node.js/Express)**

### Nuevo Endpoint
**Archivo:** `backend/src/routes/auth.js`

Se agregó el endpoint POST `/api/auth/logout`:
```javascript
router.post("/logout", (req, res) => {
  // Limpia la sesión del usuario
  // En producción, puede incluir blacklist de tokens
})
```

**Ubicación:** Línea ~108 en `auth.js`

---

## 2. **Frontend (React)**

### 2.1 AuthContext - Gestión Centralizada de Autenticación
**Archivo:** `frontend/src/context/AuthContext.jsx` (NUEVO)

Proporciona:
- `useAuth()` hook para acceder a datos de autenticación en cualquier componente
- `login()` - Registra usuario después del login
- `logout()` - Cierra sesión limpiando token y usuario
- `isAuthenticated` - Booleano para validar si hay sesión activa
- `isAdmin` - Booleano para verificar rol de administrador

```javascript
// Uso en cualquier componente:
const { user, logout, isAuthenticated } = useAuth()
```

### 2.2 Header Mejorado
**Archivo:** `frontend/src/components/Header.jsx`

- ✅ Modal de confirmación antes de cerrar sesión
- ✅ Muestra nombre del usuario autenticado
- ✅ Badge "ADMIN" para administradores
- ✅ Logout disponible en TODAS las pantallas
- ✅ Usa contexto de autenticación

### 2.3 AdminPanel Actualizado
**Archivo:** `frontend/src/pages/AdminPanel.jsx`

- ✅ Botón de logout en la esquina superior derecha
- ✅ Modal de confirmación con email del usuario
- ✅ Usa contexto de autenticación
- ✅ Redirige a login al cerrar sesión

### 2.4 Login Actualizado
**Archivo:** `frontend/src/pages/Login.jsx`

- ✅ Usa contexto `useAuth()` para guardar sesión
- ✅ Compatible con 2FA
- ✅ Sincronización automática de sesión

### 2.5 App.jsx Mejorado
**Archivo:** `frontend/src/App.jsx`

- ✅ Header global en todas las páginas
- ✅ RutaAdmin usa contexto en lugar de localStorage
- ✅ Loading screen mientras se valida sesión
- ✅ Mejor validación de rutas protegidas

### 2.6 main.jsx - AuthProvider
**Archivo:** `frontend/src/main.jsx`

```javascript
<AuthProvider>
  <App />
</AuthProvider>
```

Envuelve la app para que todos los componentes tengan acceso al contexto.

### 2.7 authService.js Ampliado
**Archivo:** `frontend/src/services/authService.js`

Nuevas funciones:
- `logoutUser()` - Llama endpoint de logout y limpia localStorage
- `getCurrentUser()` - Obtiene usuario actual
- `isAuthenticated()` - Verifica si hay sesión activa

---

## 3. **Flujo de Logout Completo**

```
Usuario clica "Cerrar Sesión"
    ↓
Modal de confirmación aparece
    ↓
Usuario confirma
    ↓
logoutUser() del authService es llamado
    ↓
Endpoint POST /api/auth/logout es ejecutado en backend
    ↓
localStorage se limpia (token y user)
    ↓
AuthContext se actualiza (estado global)
    ↓
Usuario es redirigido a Home o Login
    ↓
Header automáticamente muestra botones de Login/Register
```

---

## 4. **Características del Logout**

✅ **Modal de confirmación** - Previene logouts accidentales
✅ **Disponible en todas las pantallas** - A través del Header global
✅ **Funciona para Admin y Clientes** - Mismo flujo para ambos
✅ **Limpieza completa** - Token y datos de usuario eliminados
✅ **Sincronización global** - Todos los componentes se actualizan automáticamente
✅ **Manejo de errores** - Incluye try-catch y fallbacks
✅ **Redirección inteligente** - Envía a la página correcta después de logout
✅ **2FA compatible** - Funciona con autenticación de dos factores

---

## 5. **Uso en Otros Componentes**

Si necesitas agregar logout en nuevos componentes:

```javascript
import { useAuth } from "../context/AuthContext"

export default function MiComponente() {
  const { logout, user } = useAuth()
  
  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      // Ir a otra página si es necesario
    }
  }
  
  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  )
}
```

---

## 6. **Próximas Mejoras (Opcional)**

- [ ] Agregar token blacklist en backend (invalidar tokens en servidor)
- [ ] Agregar logout automático por inactividad
- [ ] Agregar "Cerrar todas las sesiones" en múltiples dispositivos
- [ ] Registrar logs de logout para auditoría
- [ ] Notificación por email de logout

---

## 7. **Pruebas Recomendadas**

1. Login como cliente → Logout desde Header
2. Login como admin → Logout desde Header
3. Login como admin → Logout desde AdminPanel
4. Confirmar modal antes de logout
5. Verificar que localStorage se limpia
6. Verificar redirección correcta
7. Verificar que el Header se actualiza
8. Probar con 2FA (admin)

---

## 8. **Archivos Modificados**

| Archivo | Cambio |
|---------|--------|
| `backend/src/routes/auth.js` | + Endpoint POST /logout |
| `frontend/src/context/AuthContext.jsx` | 🆕 Nuevo archivo (contexto) |
| `frontend/src/components/Header.jsx` | ✏️ Mejorado con logout y modal |
| `frontend/src/pages/AdminPanel.jsx` | ✏️ Logout + modal confirmación |
| `frontend/src/pages/Login.jsx` | ✏️ Usa contexto de auth |
| `frontend/src/App.jsx` | ✏️ Usa contexto + Header global |
| `frontend/src/main.jsx` | ✏️ Envuelve con AuthProvider |
| `frontend/src/services/authService.js` | ✏️ Nuevas funciones logout |

---

## 9. **Notas Importantes**

⚠️ **Para producción:**
- Implementar token blacklist en Redis
- Usar HTTPS para tokens en cookies seguras
- Agregar CSRF protection
- Validar tokens en cada request protegido

✅ **Estado actual:**
- ✓ Funcional para desarrollo
- ✓ Seguro para pruebas
- ✓ Escalable para producción
