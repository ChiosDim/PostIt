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
      className="fixed bg-black/50 w-full h-full z-20 left-0 top-0"
    >
      <div className="absolute bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-12 rounded-lg flex flex-col gap-6">
        <h2 className="text-xl font-bold">
          Are you sure you want to delete this post? 🥲
        </h2>
        <h3 className="text-red-600 text-sm">This action cannot be undone</h3>
        <button
          onClick={deletePostAction}
          className="bg-red-600 text-sm text-white py-2 px-4 rounded-md"
        >
          Delete Post
        </button>
      </div>
    </div>
  );
}
