"use client";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";

export default function AddComment({ postId }: { postId: string }) {
  const [title, setTitle] = useState("");
  const [isDisabled, setiIsDisabled] = useState(false);
  const queryClient = useQueryClient();
  const commentToastId = useRef<string>(undefined);
  const { mutate } = useMutation<
    AxiosResponse,
    Error,
    { title: string; id: string }
  >({
    mutationFn: async (data: { title: string; id: string }) =>
      axios.post("/api/comments/addComment", data),
    onSuccess: (data) => {
      setTitle("");
      setiIsDisabled(false);
      toast.success("Comment added successfully!", {
        id: commentToastId.current,
      });
    },
    onError: (error) => {
      setiIsDisabled(false);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to post comment", {
          id: commentToastId.current,
        });
      } else {
        toast.error("Failed to post comment", { id: commentToastId.current });
      }
    },
  });

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setiIsDisabled(true);
    commentToastId.current = toast.loading("Adding your comment...", {
      id: commentToastId.current,
    });
    mutate({ title, id: postId });
  };

  return (
    <form onSubmit={submitComment} className="my-8">
      <h3>Add a comment</h3>
      <div className="flex flex-col bg-white rounded-md my-2">
        <input
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          type="text"
          name="title"
          className="p-4 text-lg rounded-md my-2"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={isDisabled}
          className="text-sm bg-teal-600 text-white py-2 px-5 rounded-md"
          type="submit"
        >
          Add Comment
        </button>
        <p
          className={`font-bold ${
            title.length > 300 ? "text-red-700" : "text-gray-700"
          }`}
        >
          {`${title.length}/300`}
        </p>
      </div>
    </form>
  );
}
