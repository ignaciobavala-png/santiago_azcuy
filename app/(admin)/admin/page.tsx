import Link from "next/link";
import { iniciarSesion } from "@/lib/admin/acciones-sesion";
import { tableroAdmin } from "@/lib/admin/datos";
import { tieneSesion } from "@/lib/admin/sesion";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const sesion = await tieneSesion();

  if (!sesion) return <Login fallo={p.fallo === "1"} bloqueo={p.bloqueo === "1"} />;

  const tablero = await tableroAdmin();
  return <Tablero t={tablero} />;
}

function Login({ fallo, bloqueo }: { fallo: boolean; bloqueo: boolean }) {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-1px)] w-full max-w-sm flex-col justify-center px-5">
      <p className="etiqueta text-tinta-suave">Santiago Azcuy</p>
      <h1 className="titular mt-3">Panel</h1>

      <form action={iniciarSesion} className="mt-8">
        <label htmlFor="clave" className="etiqueta mb-2 block text-tinta-media">
          Contraseña
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          required
          autoFocus
          className="w-full rounded-md border border-linea bg-papel px-3 py-2.5 text-base outline-none transition-colors focus:border-tinta-media"
        />
        {fallo && (
          <p role="alert" className="mt-3 text-sm text-tinta">
            Contraseña incorrecta.
          </p>
        )}
        {bloqueo && (
          <p role="alert" className="mt-3 text-sm text-tinta">
            Demasiados intentos. Esperá un minuto y volvé a probar.
          </p>
        )}
        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-tinta px-3 py-2.5 text-sm text-papel transition-opacity hover:opacity-85"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}

function Tarjeta({
  valor,
  etiqueta,
  href,
  alarma = false,
}: {
  valor: number;
  etiqueta: string;
  href: string;
  alarma?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block border border-linea bg-papel p-5 transition-colors hover:border-tinta-media"
    >
      <p className={`text-3xl font-medium tracking-tight ${alarma && valor > 0 ? "text-tinta" : "text-tinta"}`}>
        {valor}
      </p>
      <p className="etiqueta mt-2 text-tinta-media">{etiqueta}</p>
    </Link>
  );
}

function Tablero({ t }: { t: Awaited<ReturnType<typeof tableroAdmin>> }) {
  return (
    <main className="mx-auto max-w-[1600px] px-5 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="titular">Tablero</h1>
        <Link href="/admin/obras/nueva" className="etiqueta border border-linea px-4 py-2 hover:border-tinta-media">
          Nueva obra +
        </Link>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-px border border-linea bg-linea sm:grid-cols-3 lg:grid-cols-6">
        <Tarjeta valor={t.publicadas} etiqueta="Obras publicadas" href="/admin/obras" />
        <Tarjeta valor={t.sinAnio} etiqueta="Obras sin año" href="/admin/obras?sinanio=1" alarma />
        <Tarjeta valor={t.sinFicha} etiqueta="Sin técnica o medidas" href="/admin/obras?sinficha=1" alarma />
        <Tarjeta valor={t.destacadas} etiqueta="Destacadas en la home" href="/admin/obras?destacadas=1" />
        <Tarjeta valor={t.sinLeer} etiqueta="Consultas sin leer" href="/admin/consultas" alarma />
        <Tarjeta valor={t.leads} etiqueta="Mails del libro" href="/admin/libro" />
      </section>

      <p className="mt-6 max-w-prose text-sm leading-relaxed text-tinta-media">
        La galería va de la obra más nueva a la más vieja, cronológica dentro de
        cada categoría. Las obras sin año quedan al final de su categoría: cada
        año que se carga acomoda una más en su lugar. Las destacadas son las que
        rotan en el bloque grande de la home; si no hay ninguna, salen las
        primeras del orden general. Lo que se publica sale en vivo, sin esperar
        la hora de caché del sitio.
      </p>
    </main>
  );
}
