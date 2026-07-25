"use client";

import Link from "next/link";
import { navigation } from "./navItems";
import "@/styles/navigation.css";

interface NavigationProps {
  onNavigate?: () => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  return (
    <nav className="navigation" aria-label="Menu Principal">
      {navigation.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={onNavigate}
          className="navigation__link"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
