# ✨ Sistema de Loading Mejorado - 3 Estados

## Cambios implementados:

### 📁 Nuevo Componente:
**`src/components/darwinly/loading-transition.tsx`**
- Animación circular con 3 anillos giratorios
- Icono Sparkles en el centro  
- 3 duraciones distintas según el tipo de búsqueda
- Labels descriptivos para cada estado

### 🔄 Modificaciones en deepDiveAction:
**`src/app/actions/deepDive.ts`**
- Agregado `userSearched?: boolean` al tipo `DeepDiveFullResponse`
- Lógica para detectar si el usuario ya buscó este término antes
- Al hacer cache hit: verifica tabla `userSearch` para ese usuario

### 🎣 Actualizar Hook:
**`src/hooks/use-search-data.ts`**
- Agregados estados `fromCache` y `userSearched`
- Se pasan desde la respuesta de deepDiveAction
- Se devuelven en el objeto del hook

### 🎨 Actualización de Componente:
**`src/components/darwinly/search-results.tsx`**
- Importa y usa el nuevo `LoadingTransition`
- Determina el estado dinámicamente según:
  - `!fromCache && !userSearched` → **first-time-no-cache** (6 segundos)
  - `fromCache && !userSearched` → **first-time-with-cache** (3.2 segundos)  
  - `fromCache && userSearched` → **cached-for-user** (0.8 segundos)
- Skeleton loader solo aparece en caso 3

---

## Los 3 Casos:

### 1️⃣ **Primera búsqueda, sin caché global**
- Término nunca fue buscado por nadie
- **Animación larga (6s)** con label "Consultando fuentes..."
- Luego streaming secuencial del contenido

### 2️⃣ **Primera búsqueda del usuario, pero caché existe**
- Otro usuario ya buscó esto antes
- **Animación de simul (3.2s)** con label "Generando contenido..."
- Luego streaming secuencial del contenido

### 3️⃣ **El usuario ya buscó esto antes**
- Está completamente en caché (usuario + sistema)
- **Load rápido (0.8s)** con skeleton visible
- Luego streaming secuencial del contenido
