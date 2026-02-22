"use client"

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/lib/constants";

const LeftSideBar = () => {
  const pathname = usePathname();

  return (
    <div className="h-screen left-0 top-0 sticky p-8 flex flex-col gap-12 bg-slate-950 text-white shadow-2xl max-lg:hidden">
      <Image src="/logo.png" alt="logo" width={150} height={70} />

      <div className="flex flex-col gap-7">
        {navLinks.map((link) => (
          <Link
            href={link.url}
            key={link.label}
            className={`flex items-center gap-4 rounded-lg px-3 py-2 text-base font-medium transition ${
              pathname === link.url ? "bg-slate-800 text-cyan-300" : "text-slate-100 hover:bg-slate-800/70"
            }`}
          >
            {link.icon} <p>{link.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-auto flex gap-4 text-base items-center rounded-lg bg-slate-900/70 px-3 py-2">
        <UserButton />
        <p>Edit Profile</p>
      </div>
    </div>
  );
};

export default LeftSideBar;
