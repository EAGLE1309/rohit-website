"use client";

import { useEffect, useState } from "react";
import Link from "@/components/navigations/link";
import { Moon, Sparkle, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import ThemeSlider from "../theme-slider";

const items = [
  { title: "Home", href: "/" },
  { title: "Work", href: "/work" },
  { title: "About", href: "/about" },
  { title: "Sounds", href: "/sounds" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [onHero, setOnHero] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const heroSection = document.getElementById("hero");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnHero(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const navClasses = onHero ? "bg-transparent text-white" : "bg-white text-black";

  return (
    <nav className={`fixed transition-all duration-300 ease-in-out w-full top-0 z-50 px-3 ${navClasses}`}>
      <div className="h-auto w-full py-3 lg:mx-auto max-w-screen-xl flex justify-between items-center">
        <Link href="/" className={`flex leading-5 items-center text-lg font-medium font-neue gap-3 ${onHero ? "text-tertiary" : "text-black"}`}>
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
          <Button className={`!px-1.5 ${onHero ? "text-tertiary" : "text-black"}`} onClick={() => setOpen(!open)} variant="outline">
            {open ? <Sparkles className="size-6" /> : <Sparkle className="size-6" />}
          </Button>
        </div>

        <div className="">
          <Moon />
        </div>
      </div>

      {/* Mobile nav */}

      <div
        className={`md:hidden transition-all absolute z-[-1] top-0 pt-24 py-12 flex h-screen flex-col items-center gap-2 px-3 duration-300 ${
          open ? "left-0 w-full" : "left-[-100%] w-0"
        } ${onHero ? "bg-brand text-tertiary" : "bg-white text-black"}`}
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
