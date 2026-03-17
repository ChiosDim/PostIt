"use client";

type ToggleProps = {
  deletePostAction: () => void;
  setToggleAction: (toggle: boolean) => void;
};

export default function Toggle({
  deletePostAction,
  setToggleAction,
}: ToggleProps) {
  return (
    <div
      onClick={(e) => setToggleAction(false)}
      className="fixed bg-black/50 w-full h-full z-20 left-0 top-0 flex items-center justify-center p-4"
    >
      <div className="absolute bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 sm:p-12 rounded-lg flex flex-col gap-4 sm:gap-6 max-w-sm w-full">
        <h2 className="text-lg sm:text-xl font-bold text-center">
          Are you sure you want to delete this post? 🥲
        </h2>
        <h3 className="text-red-600 text-xs sm:text-sm text-center">
          This action cannot be undone
        </h3>
        <button
          onClick={deletePostAction}
          className="
            text-sm font-semibold
            text-white
            py-2.5 px-6
            rounded-lg
            transition-all duration-300 ease-in-out
            transform hover:scale-105 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
            bg-gradient-to-r from-red-500 to-red-600
            hover:from-red-400 hover:to-red-500
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Post
          </span>
        </button>
      </div>
    </div>
  );
}
