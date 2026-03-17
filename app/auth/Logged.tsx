"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

type User = {
  image: string;
};

export default function Logged({ image }: User) {
  return (
    <li className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
      <Link href={"/dashboard"}>
        <Image
          width={64}
          height={64}
          className="w-10 sm:w-14 rounded-full"
          src={image}
          alt=""
          priority
        />
      </Link>
      <button
        onClick={() => signOut()}
        className="
          relative
          text-sm font-semibold
          text-white
          py-2 sm:py-2 px-4 sm:px-6
          rounded-lg
          transition-all duration-300 ease-in-out
          transform hover:scale-105 hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
          bg-gradient-to-r from-red-500 to-red-600
          hover:from-red-400 hover:to-red-500
          w-full sm:w-auto
        "
      >
        <span className="flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </span>
      </button>
    </li>
  );
}
