type MailConfig = { emails_aviso: string; };

/** Envio por Resend. Falla con un mensaje claro si falta la configuracion. */
export async function enviarMail({ to, asunto, texto, replyTo }: { to: string[]; asunto: string; texto: string; replyTo?: string | null }) {
  if (!to.length) throw new Error("No hay destinatarios.");
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Falta configurar RESEND_API_KEY y RESEND_FROM_EMAIL para enviar mails.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, reply_to: replyTo || undefined, subject: asunto, text: texto }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`El proveedor de correo respondió ${response.status}.`);
}

export async function enviarAvisoMarket({ config, asunto, texto, replyTo }: { config: MailConfig; asunto: string; texto: string; replyTo?: string | null }) {
  const destinatarios = config.emails_aviso.split(/[;,\s]+/).map((x) => x.trim()).filter(Boolean);
  if (!destinatarios.length) throw new Error("Configurá al menos un email para recibir avisos del market.");
  await enviarMail({ to: destinatarios, asunto, texto, replyTo });
}
