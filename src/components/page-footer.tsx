import Link from "next/link";

import { SocialRow } from "@/components/social-links";
import { profile } from "@/content/profile";
import { license } from "@/content/soundtrack";

export function PageFooter() {
  return (
    <footer className="page-footer">
      <SocialRow />

      <div className="page-footer-meta">
        <span className="mono-sm">{profile.footerLeft}</span>
        <span className="mono-sm">{profile.footerRight}</span>
      </div>

      <Link href="/connect#soundtrack" className="footer-credit mono-sm">
        Soundtrack: Scott Buckley · {license.name}
      </Link>
    </footer>
  );
}
