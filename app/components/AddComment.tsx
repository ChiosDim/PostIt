"use client";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useSession, signIn } from "next-auth/react";

type Props = { postId: string; currentUserId?: string };

type CommentUser = { id: string; name: string | null; image: string | null };
type CreatedComment = {
  id: string;
  postId: string;
  userId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
};

type AddCommentVars = { postId: string; message: string };

export default function AddComment({ postId, currentUserId }: Props) {
  const { status } = useSession();
  const [message, setMessage] = React.useState("");
  const [isDisabled, setIsDisabled] = React.useState(false);
  const qc = useQueryClient();
  const toastId = React.useRef<string | undefined>(undefined);

  const addComment = async (vars: AddCommentVars): Promise<CreatedComment> => {
    const { data } = await axios.post<CreatedComment>(
      "/api/posts/addComment",
      vars,
    );
    return data;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: addComment,
    onSuccess: (_created) => {
      setMessage("");
      setIsDisabled(false);
      toast.success("Comment added!", { id: toastId.current });
      qc.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "detail-post",
      });
    },
    onError: (err) => {
      setIsDisabled(false);
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to post comment";
      toast.error(msg, { id: toastId.current });
    },
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "authenticated") return signIn();
    const msg = message.trim();
    if (!msg) return;
    setIsDisabled(true);
    toastId.current = toast.loading("Adding your comment...");
    mutate({ postId, message: msg });
  };

  return (
    <form onSubmit={submit} className="my-4 sm:my-8">
      <h3 className="font-semibold text-sm sm:text-base">Add a comment</h3>
      <div className="flex flex-col bg-white rounded-md my-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          name="message"
          placeholder="Write a comment…"
          className="p-3 sm:p-4 text-sm sm:text-lg rounded-md my-2 w-full"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <button
          disabled={isDisabled || isPending || message.trim().length === 0}
          className="
            text-sm font-semibold
            text-white
            py-2 px-4 sm:px-5
            rounded-lg
            w-full sm:w-auto
            transition-all duration-300 ease-in-out
            transform hover:scale-105 hover:shadow-lg
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
            bg-gradient-to-r from-teal-500 to-teal-600
            hover:from-teal-400 hover:to-teal-500
          "
          type="submit"
        >
          {isPending ? "Posting…" : "Add Comment"}
        </button>
        <p
          className={`font-bold text-xs sm:text-sm ${
            message.length > 300 ? "text-red-700" : "text-gray-700"
          }`}
        >
          {`${message.length}/300`}
        </p>
      </div>
    </form>
  );
}
