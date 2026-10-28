import Link from "next/link";
import { place, text } from "@/lib/place";

const p = place(1440);
const nav = text(36, 45.0703);

const links = [
  { key: "work", href: "/", label: "Work", x: 1112 },
  { key: "about", href: "/about", label: "About", x: 1266 },
] as const;

/** Menu do topo (Figma 49:28/49:29): página atual e hover em #A45E02. */
export function Header({ active }: { active: (typeof links)[number]["key"] }) {
  return (
    <header className="cv absolute inset-x-0 top-0 z-10">
      <nav aria-label="Main">
        {links.map((l) => (
          <Link
            key={l.key}
            href={l.href}
            aria-current={active === l.key ? "page" : undefined}
            className={`abs t anim font-contrail hover:text-accent max-md:[--fs:64]! ${
              active === l.key ? "text-accent" : "text-ink"
            }`}
            style={p(l.x, 63, undefined, undefined, nav)}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
