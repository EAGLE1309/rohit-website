import React from "react";
import MaxWidthWrapper from "./max-width-wrapper";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="w-full">
      <footer className="w-full overflow-x-hidden h-full bg-black text-white px-2.5 py-8">
        <MaxWidthWrapper className="w-full">
          <div className="w-full flex flex-col md:flex-row justify-between md:items-center border-b-1 pb-8 md:pb-12 border-white/15">
            <div className="text-center">
              <Link href="/" className="flex leading-5 items-center font-medium gap-3">
                <span className="text-5xl font-light italic font-playfair">Artelo</span>
              </Link>
            </div>
            <p className="text-sm md:text-3xl font-light">hello@artelo.com</p>
          </div>
          <div className="w-full flex flex-col font-belleza md:flex-row gap-16 justify-between border-b-1 items-start pt-8 pb-16 md:py-16">
            <div className="flex flex-col items-start gap-6 md:gap-8">
              <p className="max-w-[425px] gap-1 text-zinc-300 text-lg md:text-xl">
                Get your art beliefs to life with Artelo. <br /> Let&apos;s create something beautiful.
              </p>
            </div>

            <div className="flex gap-12 md:justify-center flex-wrap">
              <FooterLink
                title="Navigations"
                links={[
                  {
                    href: "/",
                    title: "Home",
                  },
                  {
                    href: "/galleries",
                    title: "Galleries",
                  },
                  {
                    href: "/events",
                    title: "Events",
                  },
                  {
                    href: "/contact",
                    title: "Contact",
                  },
                ]}
              />
              <FooterLink
                title="About Artelo"
                links={[
                  {
                    href: "/about",
                    title: "About Us",
                  },
                  {
                    href: "/team",
                    title: "Team",
                  },
                  {
                    href: "/careers",
                    title: "Careers",
                  },
                ]}
              />
              <div className="flex flex-col gap-3">
                <p className="text-xl text-white">Subscribe to newsletter</p>
                <p className="text-sm md:text-md text-zinc-500 font-sans">
                  Stay updated with the <br /> latest galleries and events!
                </p>
                <input
                  type="email"
                  className="mt-1 px-6 py-3 font-sans text-sm md:text-md border-1 border-white/15 rounded-full"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-zinc-500 mt-8">©{new Date().getFullYear()} Artelo. All rights reserved.</p>

          <h1 className="text-[34.8vw] md:text-[32vw] leading-0 md:pt-[15rem] md:pb-[7.5rem] pt-[8rem] font-bold italic font-playfair">Artelo</h1>
        </MaxWidthWrapper>
      </footer>
    </div>
  );
};

export default Footer;

interface Link {
  href: string;
  title: string;
}

const FooterLink = ({ title, links }: { title: string; links: Link[] }) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl text-white">{title}</p>
      <ul className="flex flex-col md:text-md text-zinc-500 font-sans text-sm gap-1 md:gap-3">
        {links.map((link, index) => (
          <li className="py-0.5 hover:underline" key={index}>
            <Link href={link.href}>{link.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
