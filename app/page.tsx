import Link from "next/link";
import { ProfileGrid } from "@/app/components/ProfileGrid";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <h1 className={styles.logo}>
            Bento<span className={styles.logoAccent}>Folio</span>
          </h1>
          <div className={styles.navLinks}>
            <Link href="/discover" className={styles.navLink}>
              Discover
            </Link>
            <Link href="/themes" className={styles.navLink}>
              Themes
            </Link>
            <Link href="/pricing" className={styles.navLink}>
              Pricing
            </Link>
            <Link href="/editor" className={styles.navButton}>
              Create Portfolio
            </Link>
          </div>
        </nav>
        <p className={styles.tagline}>
          Your portfolio, but make it ✨ beautiful ✨
        </p>
      </header>

      <ProfileGrid />

      <footer className={styles.footer}>
        <p className={styles.branding}>
          Built with <a href="/">BentoFolio</a>
        </p>
      </footer>
    </div>
  );
}
