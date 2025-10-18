"use client";

import { useEffect, useState } from "react";
import Link from "@/components/navigations/link";
import { Sparkle, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import ThemeSelectors from "../theme/theme-selectors";

const items = [
  { title: "Home", href: "/" },
  { title: "Work", href: "/work" },
  { title: "About", href: "/about" },
  { title: "Sounds", href: "/sounds" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`fixed transition-all bg-background duration-300 ease-in-out w-full top-0 z-50 px-3`}>
      <div className="h-auto w-full py-3 lg:mx-auto max-w-screen-xl flex justify-between items-center">
        <Link href="/" className={`flex leading-5 items-center text-lg font-medium font-neue gap-3`}>
          Ro6it
        </Link>

        <div className="gap-2 py-4 hidden md:flex items-center">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="font-neue text-md hover:translate-y-[-2px] transition-all flex items-center gap-1">
              {item.title},
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Button className={`!px-1.5`} onClick={() => setOpen(!open)} variant="outline">
            {open ? <Sparkles className="size-6" /> : <Sparkle className="size-6" />}
          </Button>
        </div>

        <ThemeSelectors />
      </div>

      {/* Mobile nav */}

      <div
        className={`md:hidden transition-all absolute z-[-1] top-0 pt-24 py-12 flex h-screen flex-col items-center gap-2 px-3 duration-300 ${
          open ? "left-0 w-full" : "left-[-100%] w-0"
        }`}
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="w-full text-2xl font-belleza py-2 flex items-center gap-2">
            <WandSparkles className="size-6" />
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
