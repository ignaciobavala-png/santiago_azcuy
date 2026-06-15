# Roadmap Comercial — Santiago Azcuy Arte

> Plan para convertir el sitio en una máquina de ventas de obras de arte nacional e internacional.
> Fecha de creación: 2026-06-14

---

## Estado actual

El sitio cuenta con galería pública, detalle de obra con lightbox, formulario de contacto básico y panel admin. La infraestructura técnica (Next.js, Supabase, Vercel) soporta todas las fases descritas abajo sin cambios de arquitectura mayores.

---

## Tier 1 — Conversión directa

> Impacto inmediato en ventas. Sin esto no hay caja registradora.

### 1.1 Checkout + pagos
- Integrar **Stripe** (internacional, USD) y/o **MercadoPago** (Argentina, ARS)
- Flujo: obra → botón "Comprar" → checkout → pago → confirmación por email
- Tabla `ordenes` en Supabase: obra, comprador, monto, moneda, estado, fecha
- Webhook de Stripe/MP para marcar obra como vendida automáticamente

### 1.2 Formulario de consulta mejorado
- Pre-rellenar con slug y título de la obra desde query param (`?obra=ofir`)
- Campo de mensaje libre + nombre + email + país
- Guardar en tabla `consultas` de Supabase
- Email automático al artista vía **Resend** con detalle de la consulta
- Email de confirmación al interesado

### 1.3 Reserva / señal
- Botón "Reservar con señal" en obras disponibles
- El comprador paga un % (ej. 30%) para apartar la obra
- La obra pasa a estado `reservada` (visible pero no disponible)
- Contacto posterior para coordinar pago del saldo y envío

---

## Tier 2 — Confianza y credibilidad

> Necesario para ventas internacionales. El comprador remoto necesita certezas.

### 2.1 Certificado de autenticidad digital
- PDF generado automáticamente post-compra
- Datos: título, técnica, dimensiones, año, firma del artista, número de certificado
- QR que apunta a una URL de verificación pública (`/verificar/[codigo]`)
- Firmado digitalmente, guardado en Supabase Storage

### 2.2 Página de envíos y logística
- Ruta `/envios` con información clara de:
  - Embalaje profesional de obras (caja de madera, protección de bordes)
  - Empresas de transporte utilizadas (ej. OCA, FedEx, DHL)
  - Tiempos estimados por destino (Argentina, América Latina, Europa, EE.UU.)
  - Seguro de envío incluido o opcional
  - Gestión de aduana para envíos internacionales
- Esta página elimina el mayor bloqueante para compradores del exterior

### 2.3 Historial de ventas / colecciones privadas
- Campo `coleccion_privada` en tabla `obras` (texto libre, ej. "Colección privada, París")
- Mostrar en detalle de obra cuando la obra no está disponible
- Genera prueba social enorme ("otros ya compraron")

### 2.4 Idioma inglés (i18n)
- Sin inglés no hay mercado internacional real
- Implementar con `next-intl` o rutas `/en/` paralelas
- Prioridad de traducción: home, detalle de obra, página de envíos, contacto

---

## Tier 3 — Retención y marketing

> Para construir audiencia y que los interesados vuelvan.

### 3.1 Newsletter / lista de espera
- En obras no disponibles: formulario "Avisame si hay obras similares disponibles"
- Captura email + preferencias (técnica, rango de precio)
- Integrar con **Resend** para envíos masivos o **Mailchimp**

### 3.2 Wishlist / favoritos
- Guardar obras favoritas en `localStorage` (sin necesidad de cuenta)
- Botón de corazón en `ObraCard` y en detalle de obra
- Página `/favoritos` con las obras guardadas

### 3.3 Exposiciones y agenda
- Ruta `/exposiciones` con listado de muestras (pasadas y próximas)
- Datos ya existen en tabla `exposiciones` (individual/colectiva, institución, año)
- Muestra que el artista tiene actividad pública y reconocimiento institucional

---

## Ruta crítica para el primer lanzamiento comercial

```
1. Formulario de contacto funcional con Resend   ← ya en Fase 3 del plan técnico
2. Página de envíos y logística                  ← contenido, no código
3. Checkout con Stripe (USD)                     ← Tier 1.1
4. Email de confirmación de compra               ← parte del checkout
5. Página /envios                                ← Tier 2.2
```

Con estos 5 puntos el sitio puede vender a compradores internacionales.

---

## Decisiones pendientes del artista

| Decisión | Opciones |
|---|---|
| ¿Venta directa online o solo consulta? | Solo consulta (MVP rápido) / Checkout completo |
| ¿Qué pasarela de pagos? | Stripe (internacional) / MercadoPago / ambas |
| ¿Hay prints de edición limitada? | Sí → nuevo tipo de producto / No → solo originales |
| ¿Versión en inglés? | Sí, desde el inicio / Más adelante |
| ¿Se requiere reserva con señal? | Sí / No |

---

## Tabla de fases comerciales

| Tier | Descripción | Impacto | Estado |
|------|-------------|---------|--------|
| 1 | Conversión directa (checkout, consulta, reserva) | Alto | ⏳ Pendiente |
| 2 | Confianza internacional (certificado, envíos, i18n) | Alto | ⏳ Pendiente |
| 3 | Retención y marketing (newsletter, wishlist, agenda) | Medio | ⏳ Pendiente |
