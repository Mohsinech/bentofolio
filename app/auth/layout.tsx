import Link from "next/link";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import styles from "./auth.module.css";

// Shared frame for sign up, log in, password reset and confirmation.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bentoFontClasses} ${styles.shell}`}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="bentofolio home">
          <span className={styles.mark} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          bentofolio
        </Link>
        <Link href="/pricing" className={styles.topLink}>
          Pricing
        </Link>
      </header>
      {children}
    </div>
  );
}
