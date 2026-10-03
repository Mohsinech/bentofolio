import { bentoFontClasses } from "@/app/components/bento/fonts";
import { MarketingHeader } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import { Bone, CardsSkeleton } from "@/app/components/skeleton/Skeleton";
import s from "./discover.module.css";

// Shown instantly while the list loads.
export default function DiscoverLoading() {
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
        </section>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Bone w={460} h={46} style={{ maxWidth: "100%", borderRadius: 12 }} />
          <CardsSkeleton />
        </div>
      </main>
    </div>
  );
}
