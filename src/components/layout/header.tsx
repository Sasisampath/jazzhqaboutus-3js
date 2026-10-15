"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { JOURNEYS, NAV_ITEMS, ROUTES } from "@/data/navigation";
import { NavItem } from "@/components/ui/nav-item";
import { VinylIcon } from "@/components/ui/vinyl-icon";
import "./header.css";

function JourneyRows({ onChoose, menu = false }: { onChoose: () => void; menu?: boolean }) {
  return (
    <>
      {JOURNEYS.map((journey) => (
        <NavItem key={journey.key} href={journey.href} className="site-journey" onNavigate={onChoose} role={menu ? "menuitem" : undefined}>
          <VinylIcon journey={journey.key} />
          <span className="site-journey__text">
            <span className="site-journey__title">{journey.title}</span>
            <span className="site-journey__desc">{journey.description}</span>
          </span>
          <ArrowRight className="site-journey__arrow" size={20} strokeWidth={1.75} aria-hidden="true" />
        </NavItem>
      ))}
    </>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => items()[0]?.focus());
  };
  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % list.length;
    else if (event.key === "ArrowUp") next = (index - 1 + list.length) % list.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;
    else if (event.key === "Tab") { setOpen(false); return; }
    if (next < 0) return;
    event.preventDefault();
    list[next]?.focus();
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={ROUTES.home} className="site-header__logo" aria-label="JazzHQ home">
          <Image src="/assets/logo/jazzhq.svg" alt="JazzHQ" width={132} height={32} priority />
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} href={item.href} className="site-header__link">{item.label}</NavItem>
          ))}
        </nav>

        <div className="site-header__cta" ref={wrapRef}>
          <button
            ref={triggerRef}
            type="button"
            className="site-getstarted"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="get-started-menu"
            onClick={() => setOpen((value) => !value)}
            onKeyDown={onTriggerKey}
          >
            Get started
            <ChevronDown className="site-getstarted__chevron" size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>

          {open && (
            <div id="get-started-menu" ref={menuRef} className="site-getstarted-menu" role="menu" aria-label="Get started" onKeyDown={onMenuKey}>
              <p className="site-getstarted-menu__title">Get started</p>
              <p className="site-getstarted-menu__sub">Choose how you want to use JazzHQ</p>
              <div className="site-getstarted-menu__rows">
                <JourneyRows menu onChoose={() => setOpen(false)} />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="site-header__burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <div id="site-mobile-menu" className="site-mobile-menu">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} href={item.href} className="site-mobile-menu__link" onNavigate={() => setMenuOpen(false)}>{item.label}</NavItem>
          ))}
          <p className="site-mobile-menu__heading">Get started</p>
          <div className="site-mobile-menu__rows">
            <JourneyRows onChoose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
