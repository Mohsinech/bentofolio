import Link from "next/link";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { FooterLinks, MarketingHeader } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import { getDiscoverProfiles } from "@/app/lib/discover";
import { DiscoverGrid } from "./DiscoverGrid";
import s from "./discover.module.css";

// Rebuilt at most every 10 minutes.
export const revalidate = 600;

export default async function DiscoverPage() {
  const profiles = await getDiscoverProfiles();
  const verified = profiles.filter((profile) => profile.verifiedRevenue).length;

  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.page}`}>
      <MarketingHeader active="discover" />

      <main className={`${m.sec} ${s.main}`}>
        <section className={s.hero}>
          <p className={m.lbl}>Discover</p>
          <h1 className={s.title}>
            Pages built on <span className={m.ser}>proof.</span>
          </h1>
          <p className={s.lead}>
            Developers, designers and founders showing their real work. A blue check on revenue means the
            numbers come straight from Stripe or Lemon Squeezy.
          </p>
          {profiles.length > 0 && (
            <p className={s.counts}>
              <span>{profiles.length} pages</span>
              {verified > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{verified} with verified revenue</span>
                </>
              )}
            </p>
          )}
        </section>

        <DiscoverGrid profiles={profiles} />

        <section className={s.cta}>
          <div>
            <h2>Your page belongs here.</h2>
            <p>Free to start. New pages are listed here once they have a name, a headline and a few blocks.</p>
          </div>
          <Link href="/auth/signup" className={`${m.btn} ${m.btnAccent}`}>
            Make your page
          </Link>
        </section>
      </main>

      <FooterLinks light />
    </div>
  );
}
