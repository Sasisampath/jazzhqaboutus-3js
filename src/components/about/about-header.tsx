"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

/* About Us-only header: brand + the two existing CTAs. The shared site header
   (with Home / Marketplace navigation) is left untouched for other pages. */

const CTA_LINKS = [
  { href: "/for-vendors", label: "List Your Product", tone: "purple" },
  { href: "/for-partners", label: "Become a Partner", tone: "red" },
] as const;

export function AboutHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="au-header">
      <div className="au-header__inner">
        <Link href="/" className="au-header__logo" aria-label="JazzHQ">
          <Image
            src="/assets/logo/jazzhq.svg"
            alt="JazzHQ"
            width={132}
            height={32}
            priority
            style={{ width: "auto", height: 32 }}
          />
        </Link>

        <p className="au-header__here" aria-current="page">
          About Us
        </p>

        <nav className="au-header__cta" aria-label="Get started">
          {CTA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`au-header__btn au-header__btn--${link.tone}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="au-header__toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="au-header-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden>{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {menuOpen && (
        <nav id="au-header-menu" className="au-header__menu" aria-label="Get started">
          {CTA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`au-header__btn au-header__btn--${link.tone}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
