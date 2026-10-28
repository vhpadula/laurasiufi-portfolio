import Link from "next/link";
import { place, text } from "@/lib/place";

const p = place(1440);
const nav = text(36, 45.0703);

const links = [
  { key: "work", href: "/", label: "Work", x: 1112 },
  { key: "about", href: "/about", label: "About", x: 1266 },
] as const;

/**
 * Menu do topo (Figma 49:28/49:29): página atual e hover em #A45E02. `brand` mostra o nome no canto
 * esquerdo, como no About (15:276).
 */
export function Header({
  active,
  brand = false,
}: {
  active: (typeof links)[number]["key"];
  brand?: boolean;
}) {
  return (
    <header className="cv absolute inset-x-0 top-0 z-10">
      {brand && (
        <Link
          href="/"
          className="abs t font-notable text-ink max-md:[--fs:64]!"
          style={p(64, 62, undefined, undefined, text(36, 34.7414, 0, 1))}
        >
          Laura Siufi
        </Link>
      )}
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
