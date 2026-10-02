import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import {
  DomainError,
  addDomain,
  checkDomain,
  checkDomainStatus,
  domainProblemMessage,
  normalizeDomain,
  removeDomain,
  vercelConfigFromEnv,
} from "@/app/lib/domains";

// Custom domain (Pro): GET status, POST { domain } connect, DELETE remove.

const NOT_CONFIGURED = "Custom domains aren't switched on for this site yet.";

async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("is_pro, custom_domain").eq("id", user.id).maybeSingle();
  return { supabase, user, profile };
}

function failure(error: unknown) {
  if (error instanceof DomainError) {
    const status = error.code === "in_use" ? 409 : error.code === "invalid" ? 400 : 502;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }
  console.error("Custom domain error:", error);
  return NextResponse.json({ error: "Couldn't reach Vercel. Try again in a minute." }, { status: 502 });
}

export async function GET() {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const domain = ctx.profile?.custom_domain as string | null;
  const config = vercelConfigFromEnv();
  if (!domain) return NextResponse.json({ domain: null, configured: Boolean(config) });
  if (!config) return NextResponse.json({ domain, configured: false, error: NOT_CONFIGURED });
  try {
    return NextResponse.json({ domain, configured: true, status: await checkDomainStatus(config, domain) });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  if (!ctx.profile?.is_pro) return NextResponse.json({ error: "Custom domains are part of Pro." }, { status: 403 });
  const config = vercelConfigFromEnv();
  if (!config) return NextResponse.json({ error: NOT_CONFIGURED }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as { domain?: unknown };
  const domain = normalizeDomain(typeof body.domain === "string" ? body.domain : "");
  const problem = checkDomain(domain);
  if (problem) return NextResponse.json({ error: domainProblemMessage(problem) }, { status: 400 });

  const previous = (ctx.profile.custom_domain as string | null) ?? null;
  if (previous === domain) {
    return NextResponse.json({ domain, configured: true, status: await checkDomainStatus(config, domain) });
  }

  // Claim it in the database first: the unique index stops two pages from
  // taking the same domain.
  const { error: saveError } = await ctx.supabase.from("profiles").update({ custom_domain: domain }).eq("id", ctx.user.id);
  if (saveError) {
    const taken = saveError.code === "23505";
    return NextResponse.json(
      { error: taken ? "Another page already uses this domain." : "Couldn't save the domain." },
      { status: taken ? 409 : 500 }
    );
  }

  try {
    await addDomain(config, domain);
  } catch (error) {
    await ctx.supabase.from("profiles").update({ custom_domain: previous }).eq("id", ctx.user.id);
    return failure(error);
  }
  if (previous) await removeDomain(config, previous).catch(() => null);

  try {
    return NextResponse.json({ domain, configured: true, status: await checkDomainStatus(config, domain) });
  } catch {
    return NextResponse.json({ domain, configured: true, status: null });
  }
}

export async function DELETE() {
  const ctx = await context();
  if ("error" in ctx) return ctx.error;
  const domain = ctx.profile?.custom_domain as string | null;
  if (!domain) return NextResponse.json({ domain: null });
  const config = vercelConfigFromEnv();
  if (config) {
    try {
      await removeDomain(config, domain);
    } catch (error) {
      return failure(error);
    }
  }
  await ctx.supabase.from("profiles").update({ custom_domain: null }).eq("id", ctx.user.id);
  return NextResponse.json({ domain: null });
}
