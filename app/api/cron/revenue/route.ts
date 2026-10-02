import { NextResponse } from "next/server";
import { syncAllConnections } from "@/app/lib/revenue/service";

// Daily refresh of every revenue connection, called by Vercel Cron
// (see vercel.json). Vercel sends "Authorization: Bearer <CRON_SECRET>".
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await syncAllConnections();
  return NextResponse.json(result);
}
