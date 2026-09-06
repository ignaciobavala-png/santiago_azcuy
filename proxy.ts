import { NextResponse, type NextRequest } from "next/server";

/**
 * El sitio se sirve en dos idiomas pero solo uno lleva prefijo: el español vive
 * en "/" y el inglés en "/en". Esto reescribe (no redirige) todo lo que no
 * empieza con /en hacia /es, para que el segmento [lang] siempre exista del
 * lado del router sin que la URL del visitante lo muestre. Un redirect costaria
 * un salto extra en cada visita en español, que es la mayoria.
 *
 * /es/... explicito si redirige, para que la misma pagina no viva en dos URLs.
 */
export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const limpio = pathname.slice(3) || "/";
    return NextResponse.redirect(new URL(limpio + search, req.url), 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  return NextResponse.rewrite(new URL(`/es${pathname}${search}`, req.url));
}

export const config = {
  // Todo menos los estaticos y la API, que no tienen idioma.
  matcher: ["/((?!api|_next|.*\\.[a-z0-9]+$).*)"],
};
