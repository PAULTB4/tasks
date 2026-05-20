# TaskForge

Segundo cerebro para la gestión de tareas universitarias, personales y profesionales.

## Que es TaskForge

TaskForge es una aplicación de productividad que organiza tus proyectos mediante:

- **Kanban**: Tableros visuales con columnas personalizables (Por hacer, En progreso, Completado, etc.)
- **Jerarquia infinita**: Carpetas que contienen listas, que contienen tareas. Anida tanto como necesites.
- **Notas**: Cada tarea tiene su propio espacio de notas para detalles, enlaces y contexto.
- **Prioridades**: Baja, media, alta y urgente.
- **Fechas de vencimiento**: Para mantener el ritmo.
- **Papelera**: Borra carpetas, listas o tareas individuales sin perderlas para siempre.

## Stack tecnico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Estilos | Tailwind CSS 3.4 |
| Estado | Zustand (auth, theme) + React Query (servidor) |
| Drag & Drop | @dnd-kit/core + sortable |
| Backend | InsForge (PostgreSQL + PostgREST + Auth) |
| SDK | @insforge/sdk |

## Estructura del proyecto

```
task/
├── frontend/          # Aplicacion React
│   ├── src/
│   │   ├── components/    # UI components (atomic design)
│   │   │   ├── categories/   # Arbol de carpetas/listas, creacion de categorias
│   │   │   ├── kanban/       # Tablero Kanban, columnas, drag & drop
│   │   │   ├── layout/       # Sidebar, ProtectedRoute
│   │   │   ├── tasks/        # Tarjetas de tarea, creacion, detalle, listado
│   │   │   └── warnings/     # Dialogos de confirmacion reutilizables
│   │   ├── hooks/         # Zustand stores + React Query hooks
│   │   ├── pages/         # Rutas principales (Landing, Auth, Dashboard)
│   │   └── lib/           # Cliente InsForge y utilidades
│   └── index.html
├── schema.sql         # Esquema de PostgreSQL con RLS
└── AGENTS.md          # Guia para agentes de IA (InsForge SDK)
```

## Requisitos

- Node.js 18+
- npm o pnpm

## Instalacion

```bash
cd frontend
npm install
```

## Variables de entorno

Crea `frontend/.env`:

```env
VITE_INSFORGE_URL=https://tu-app.region.insforge.app
VITE_INSFORGE_ANON_KEY=tu-anon-key
```

Obtiene estos valores desde el panel de InsForge o ejecutando `npm run get-metadata`.

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo (Vite)
npm run build    # Build de produccion
npm run lint     # ESLint
npm run preview  # Preview del build
```

## Convenciones del equipo

### Commits

- Usamos [Conventional Commits](https://www.conventionalcommits.org/)
- Formato: `tipo(alcance): descripcion`
- Ejemplos: `feat: add drag-and-drop to kanban`, `fix: prevent cross-user data leak`
- **No agregar** atribucion de IA (no "Co-Authored-By").

### Ramas

- `main`: Produccion / deploy
- `feature/*`: Features nuevos
- `fix/*`: Correcciones urgentes

### Estilo de codigo

- TypeScript estricto habilitado.
- Tailwind CSS para todo el estilado; **no crear CSS modules ni styled-components**.
- Componentes funcionales con hooks. **Evitar clases de React**.
- Estados derivados > `useEffect` sincronizador. Si podes calcular algo en render, no lo pongas en un effect.

### Arquitectura

- **Container/Presentational**: Los `pages/` orquestan; los `components/` solo reciben props.
- **Zustand** solo para estado global sincrono (auth, tema). **React Query** para todo lo asincrono (datos del servidor).
- **RLS**: Cada tabla tiene Row Level Security. El frontend filtra por `user_id`, pero la DB es la ultima linea de defensa.

## Flujo de trabajo para contribuir

1. **Crear rama** desde `main`:
   ```bash
   git checkout -b feature/mi-feature
   ```

2. **Desarrollar** con `npm run dev`.

3. **Verificar** antes de commitear:
   ```bash
   npm run lint
   ```

4. **Commitear** con mensaje descriptivo:
   ```bash
   git commit -m "feat: descripcion corta y clara"
   ```

5. **Push y PR**:
   ```bash
   git push origin feature/mi-feature
   ```
   Luego abrir Pull Request hacia `main`.

## Modelo de datos (resumen)

```
users (auth) --1:N--> categories --1:N--> tasks --1:N--> task_notes
                          |
                          +--1:N--> task_statuses (columnas Kanban)
```

Ver `schema.sql` para el DDL completo con indices, triggers y politicas RLS.

## Seguridad

- Toda tabla tiene **Row Level Security (RLS)** activada.
- El backend usa `current_app_user_id()` para aislamiento por usuario.
- El frontend siempre filtra queries por `user_id` como capa adicional.
- **Nunca** desactivar RLS en produccion.

## Deploy

El proyecto se despliega automaticamente en la rama `main` via InsForge hosting. No requiere configuracion extra si el build de Vite es exitoso.

## Recursos utiles

- [InsForge SDK Docs](https://docs.insforge.app) — Referencia de la API
- [Tailwind CSS](https://tailwindcss.com/docs) — Utilidades de estilo
- [React Query](https://tanstack.com/query/latest) — Manejo de estado servidor
- [Zustand](https://github.com/pmndrs/zustand) — Estado global cliente

## Contacto

Para dudas tecnicas o decisiones de arquitectura, abrir un issue en el repo o consultar `AGENTS.md` para el contexto de InsForge.
