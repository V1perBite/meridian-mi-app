# Meridian

PWA mobile-first de productividad personal enfocada en **Money** y **Streak**, construida con Next.js 15, Supabase y Tailwind CSS.

## Características

- **Money**: registro de ingresos y gastos, edición por transacción, canales y proyectos editables, filtros por proyecto/canal y vista de resumen por proyecto.
- **Streak**: hábitos diarios con racha actual, mejor racha, historial y toggle diario seguro.
- **Dashboard**: KPIs de finanzas y consistencia semanal de hábitos, más tendencia financiera.
- **Offline**: cola local en IndexedDB y sincronización al recuperar conexión.
- **Auth**: login/registro con Supabase Auth + middleware de rutas protegidas.
- **i18n**: español/inglés con cambio inmediato.
- **PWA**: service worker con `@serwist/next`.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router + TypeScript strict) |
| Backend/Auth | Supabase (PostgreSQL + RLS + Auth) |
| Estado cliente | React Query + Zustand |
| Formularios | React Hook Form + Zod |
| UI | Tailwind CSS |
| Gráficas | Recharts |
| Offline | idb (IndexedDB) |

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto Supabase activo

## Variables de entorno

1. Copia `.env.example` a `.env.local`
2. Completa al menos:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Setup local

```bash
npm install
npm run dev
```

## Migraciones Supabase

Ejecuta en este orden:

1. `supabase/migrations/001_init_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_triggers.sql`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
```

## Rutas principales

```txt
/                -> redirige a /dashboard o /login
/login           -> acceso
/register        -> registro
/dashboard       -> KPIs + tendencia financiera
/money           -> transacciones
/money/projects  -> resumen por proyecto
/streak          -> hábitos y rachas
/focus           -> redirige a /money (módulo retirado)
```

## Estado actual

- Módulo de tareas retirado del flujo principal.
- Money y Streak reforzados en validaciones y lógica.
- API de finanzas con filtros simétricos por `project` y `channel`.
- `typecheck` y `lint` en verde.

## Preparación de despliegue

Antes de desplegar con la cuenta colaboradora del repositorio:

1. Verifica variables de entorno en la plataforma de deploy (Vercel u otra).
2. Asegura que las migraciones de Supabase estén aplicadas en producción.
3. Ejecuta `npm run build` localmente como verificación final.
4. Configura dominio y callback URLs de auth en Supabase (`Site URL` y redirects).
