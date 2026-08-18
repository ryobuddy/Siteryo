import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { name, email, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "El nombre es demasiado corto." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "El email no es válido." }, { status: 400 });
  }
  if (typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json(
      { error: "Cuéntanos un poco más — al menos 10 caracteres." },
      { status: 400 }
    );
  }

  // No hay proveedor de email/CRM configurado en este entorno — se deja
  // constancia en el log del servidor. Para producción, sustituir por un
  // envío real (Resend, Postmark, un webhook al CRM, etc.).
  console.log("[contacto] nuevo lead:", { name, email, message });

  return NextResponse.json({ ok: true });
}
