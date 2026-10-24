import { GithubIcon, LinkedinIcon, MailIcon, MapPinIcon } from "@/components/icons";
import { socials, type Social } from "@/content/profile";

/**
 * Every contact channel lives in `profile.socials`; this file only decides what
 * each one looks like in each place it appears, so adding an address is a
 * one-line change in the content layer.
 */

export function SocialIcon({ name, size = 15 }: { name: Social["icon"]; size?: number }) {
  if (name === "github") return <GithubIcon size={size} />;
  if (name === "linkedin") return <LinkedinIcon size={size} />;
  if (name === "phone") return <MapPinIcon size={size} />;
  return <MailIcon size={size} />;
}

function external(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {};
}

/** The hero row — GitHub, LinkedIn and email, next to the main call to action. */
export function SocialButtons() {
  return (
    <>
      {socials
        .filter((social) => social.hero)
        .map((social) => (
          <a
            key={social.key}
            className="btn btn-ghost social-button"
            href={social.href}
            {...external(social.href)}
          >
            <SocialIcon name={social.icon} />
            {social.key}
          </a>
        ))}
    </>
  );
}

/** A compact row of labelled icons — sits in the footer of every page. */
export function SocialRow({ className = "" }: { className?: string }) {
  return (
    <nav className={`social-row ${className}`.trim()} aria-label="Contact">
      {socials.map((social) => (
        <a
          key={social.key}
          className="social-link"
          href={social.href}
          aria-label={`${social.key} — ${social.value}`}
          {...external(social.href)}
        >
          <SocialIcon name={social.icon} size={14} />
          <span>{social.key}</span>
        </a>
      ))}
    </nav>
  );
}
