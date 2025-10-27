/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import Link from "@/components/navigations/link";

import { Button } from "../ui/button";
import ThemeSelectors from "../theme/theme-selectors";
import { usePathname } from "next/navigation";
import { IconMenu, IconX } from "@tabler/icons-react";
import { useTheme } from "next-themes";

const items = [
  { title: "Home.", href: "/" },
  { title: "Work.", href: "/work" },
  { title: "Sounds.", href: "/sounds" },
  { title: "About", href: "/about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const { theme } = useTheme();

  const pathname = usePathname();

  return (
    <nav className={`fixed bg-background ease-in-out w-full top-0 z-50 px-3`}>
      <div className="h-auto w-full py-3 lg:mx-auto max-w-screen-xl flex justify-between items-center">
        <Link href="/" className={`flex leading-5 items-center text-lg font-medium font-neue gap-3`}>
          {theme === "dark" || theme === "nightfall" || theme === "midnight" ? (
            <img src="/logo-white.svg" className="h-full w-24" alt="Logo" />
          ) : (
            <img src="/logo.svg" className="h-full w-24" alt="Logo" />
          )}
        </Link>

        <div className="gap-2 py-4 hidden md:flex items-center">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-neue text-md hover:translate-y-[-2px] transition-all flex items-center gap-1 ${
                pathname === item.href ? "text-red-500 font-medium" : ""
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <ThemeSelectors />
          <Button
            className={`!px-1.5 rounded-full ${open ? (theme === "dark" ? "!bg-white/5" : "!bg-black/5") : ""}`}
            onClick={() => setOpen(!open)}
            variant="ghost"
          >
            {open ? <IconX className="size-6" /> : <IconMenu className="size-6" />}
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeSelectors />
        </div>
      </div>

      {/* Mobile nav */}

      <div
        className={`md:hidden transition-all bg-background absolute z-[-1] top-0 pt-24 py-12 flex h-screen flex-col items-center gap-2 px-3 ease-in-out duration-300 ${
          open ? "left-0 w-full" : "left-[-100%] w-0"
        }`}
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="w-full text-2xl font-belleza py-2 flex items-center gap-2">
            {pathname === item.href ? (
              <span className="text-red-500 relative">
                &nbsp;[&nbsp;&nbsp;&nbsp;
                <span className="after:absolute after:h-[3px] after:top-1/2 after:-translate-y-1/2 after:w-[38px] after:bg-current after:left-0" />]
              </span>
            ) : (
              <span>&nbsp;[&nbsp;&nbsp;&nbsp;]</span>
            )}
            &nbsp;{item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
