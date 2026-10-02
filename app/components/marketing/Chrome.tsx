import Link from "next/link";
import { AccountLinks } from "./AccountLinks";
import styles from "./marketing.module.css";

export function BrandLink() {
  return (
    <Link href="/" className={styles.brand} aria-label="bentofolio home">
      <span className={styles.mark} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      bentofolio
    </Link>
  );
}

export function MarketingHeader({ active }: { active?: "pricing" | "discover" }) {
  return (
    <header className={`${styles.sec} ${styles.header}`}>
      <BrandLink />
      <nav aria-label="Main" className={styles.nav}>
        <Link href="/discover" className={`${styles.navHideSm} ${active === "discover" ? styles.navActive : ""}`}>
          Discover
        </Link>
        <Link href="/pricing" className={`${styles.navHideSm} ${active === "pricing" ? styles.navActive : ""}`}>
          Pricing
        </Link>
        <AccountLinks />
      </nav>
    </header>
  );
}

export function FooterLinks({ light = false }: { light?: boolean }) {
  return (
    <footer className={`${styles.sec} ${styles.footer} ${light ? styles.footerLight : ""}`}>
      <span style={{ fontWeight: 600, fontSize: 15 }}>bentofolio</span>
      <nav aria-label="Footer">
        <Link href="/discover">Discover</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/contact">Contact</Link>
        <a href="https://x.com/muhsench" target="_blank" rel="noopener noreferrer">
          @muhsench
        </a>
      </nav>
    </footer>
  );
}
