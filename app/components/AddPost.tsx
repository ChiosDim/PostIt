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
    <form onSubmit={submitPost} className="bg-white my-8 p-8 rounded-md">
      <div className="flex flex-col my-4">
        <textarea
          onChange={(e) => setTitle(e.target.value)}
          name="title"
          value={title}
          placeholder="What's on your mind?"
          className="p-4 text-lg rounded-md my-2 bg-gray-200"
        ></textarea>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p
          className={`font-bold text-sm ${
            title.length > 300 ? "text-red-700" : "text-gray-700"
          }`}
        >{`${title.length}/300`}</p>
        <button
          disabled={isPending || isDisabled}
          className="text-sm bg-teal-600 text-white py-2 px-6"
          type="submit"
        >
          Create a post
        </button>
      </div>
    </form>
  );
}
