# Santiago Azcuy

Sitio web. Reiniciado desde cero: la version anterior queda archivada en el tag `v1-archivo`.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- Supabase (base de datos nueva, misma cuenta)
- Deploy en Vercel

## Desarrollo

```bash
pnpm install
pnpm dev
```

Variables de entorno en `.env.local` (ver Vercel para los valores de produccion).

## Market

La tienda crea solicitudes de compra; no procesa pagos ni reserva una obra hasta que Santiago confirma la seña. Aplicar la migración `supabase/migrations/20261005120000_market.sql` antes de habilitar la sección. Para avisos, configurar `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (remitente verificado en Resend) y cargar los destinatarios en `/admin/market`.
