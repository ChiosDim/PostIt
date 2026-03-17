"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const qc = useQueryClient();
  const { status } = useSession();
  const queryClient = useQueryClient();
  const toastPostID = useRef<string | null>(null);

  type AddPostInput = { title: string };
  type Post = { title: string };

  //Create a post
  const addPost = async (input: AddPostInput): Promise<Post> => {
    const { data } = await axios.post<Post>("/api/posts/addPost", input);
    return data;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: addPost,
    onError: (error: unknown) => {
      console.error(error);
      if (axios.isAxiosError(error)) {
        // safe access to axios response payload
        toast.error(error.response?.data?.message ?? "Request failed", {
          id: toastPostID.current ?? undefined,
        });
      } else if (error instanceof Error) {
        // generic JS error
        toast.error(error.message, { id: toastPostID.current ?? undefined });
      } else {
        toast.error("An unexpected error occurred", {
          id: toastPostID.current ?? undefined,
        });
      }
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Post created successfully!", {
        id: toastPostID.current ?? undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTitle("");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onSettled: () => {
      // always re-enable the UI after mutation finishes
      setIsDisabled(false);
      // clear stored toast id
      toastPostID.current = null;
    },
  });

  const submitPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // client-side validation: show toast when empty
    if (!title.trim()) {
      toast.error("Please do not leave this empty");
      return;
    }
    if (title.length > 300) {
      toast.error("Please write a shorter post");
      return;
    }
    if (status !== "authenticated") {
      // if not signed in, open the auth flow instead of posting
      signIn();
      return;
    }
    setIsDisabled(true);
    // show a loading toast and keep its id so success/error replace it
    toastPostID.current = toast.loading("Creating your post...");
    mutate({ title });
  };

  return (
    <form
      onSubmit={submitPost}
      className="bg-white my-4 sm:my-8 p-4 sm:p-8 rounded-md"
    >
      <div className="flex flex-col my-2 sm:my-4">
        <textarea
          onChange={(e) => setTitle(e.target.value)}
          name="title"
          value={title}
          placeholder="What's on your mind?"
          className="p-3 sm:p-4 text-base sm:text-lg rounded-md my-2 bg-gray-200 w-full resize-none"
          rows={3}
        ></textarea>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
        <p
          className={`font-bold text-xs sm:text-sm ${
            title.length > 300 ? "text-red-700" : "text-gray-700"
          }`}
        >{`${title.length}/300`}</p>
        <button
          disabled={isPending || isDisabled}
          className={`
            relative
            text-sm font-semibold
            text-white
            py-2.5 px-6
            rounded-lg
            transition-all duration-300 ease-in-out
            transform hover:scale-105 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
            ${
              isPending
                ? "bg-teal-700 animate-pulse"
                : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500"
            }
          `}
          type="submit"
        >
          <span
            className={`flex items-center justify-center gap-2 ${isPending ? "opacity-0" : "opacity-100"}`}
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Create a post</span>
            <span className="sm:hidden">Post</span>
          </span>
          {isPending && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
