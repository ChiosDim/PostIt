"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <li className="list-none">
      <button
        onClick={() => signIn()}
        className="
          relative
          text-sm font-semibold
          text-white
          py-2 sm:py-2 px-4 sm:px-6
          rounded-lg
          transition-all duration-300 ease-in-out
          transform hover:scale-105 hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
          bg-gradient-to-r from-gray-600 to-gray-700
          hover:from-gray-500 hover:to-gray-600
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
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Sign In</span>
        </span>
      </button>
    </li>
  );
}
