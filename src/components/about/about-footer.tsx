import Link from "next/link";
import "@/components/layout/footer.css";

/* About Us-only footer. Same JazzHQ footer styling (shared footer.css is
   consumed unchanged); the Company column lists About Us only. */

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/company/getjazzhq/",
    icon: "/assets/footer/linkedin.svg",
    label: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/getjazzhq/",
    icon: "/assets/footer/instagram.svg",
    label: "Instagram",
  },
  {
    href: "https://x.com/getjazzhq",
    icon: "/assets/footer/x.svg",
    label: "X",
  },
  {
    href: "https://www.youtube.com/@getjazzhq",
    icon: "/assets/footer/youtube.svg",
    label: "YouTube",
  },
  {
    href: "https://in.pinterest.com/getjazzhq/",
    icon: "/assets/footer/pinterest.svg",
    label: "Pinterest",
  },
] as const;

const COMPANY_LINKS = [{ href: "/about-us", label: "About us" }] as const;

const HELP_LINKS = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms-and-conditions", label: "Terms and conditions" },
] as const;

export function AboutFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer section-footer">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-medium footer-space">
            <div className="footer-main-row">
              <div className="footer-brand-col">
                <Link href="/" className="footer-logo-link" aria-label="JazzHQ">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/logo/jazzhq-white.svg"
                    alt="JazzHQ"
                    width={245}
                    height={40}
                    loading="lazy"
                    className="footer-logo-img"
                  />
                </Link>

                <div className="follow-us-section">
                  <p className="footer-col-title">Follow us on</p>
                  <div className="social-icons">
                    {SOCIAL_LINKS.map(({ href, icon, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="social-icon-link"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={icon}
                          alt={`${label} icon`}
                          className="social-icon-img"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </div>

                <address className="footer-address">
                  200 Continental Drive, Suite 401, Newark, Delaware, 19713, United States of America
                </address>
              </div>

              <div className="footer-nav-col">
                <div className="footer-links">
                  <div className="footer-col">
                    <p className="footer-col-title">Company</p>
                    <ul role="list" className="footer-list-wrapper">
                      {COMPANY_LINKS.map(({ href, label }) => (
                        <li key={label} className="footer-list-item">
                          <Link href={href} className="footer-link">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="footer-col">
                    <p className="footer-col-title">Help &amp; Support</p>
                    <ul role="list" className="footer-list-wrapper">
                      {HELP_LINKS.map(({ href, label }) => (
                        <li key={label} className="footer-list-item">
                          <Link href={href} className="footer-link">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p className="footer-copyright">Copyright © Jazz.HQ Inc. {year}</p>
              <div className="footer-legal-links">
                <Link href="/privacy-policy" className="footer-legal-link">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="footer-legal-link">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
