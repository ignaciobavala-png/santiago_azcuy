import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-14 pb-32 md:px-10 md:pt-20">
      <h1 className="display">404</h1>
      <p className="mt-10 text-tinta-media">Esta página no existe.</p>
      <Link href="/" className="etiqueta mt-6 inline-block underline-offset-8 hover:underline">
        Volver al inicio →
      </Link>
    </main>
  );
}
