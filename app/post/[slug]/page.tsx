"use client";

import Image from "next/image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Post from "../../components/Post";
import AddComment from "../../components/AddComment";
import type { PostType } from "../../types/Post";
import { use } from "react";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: unknown;
};

type CurrentUser = {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
} | null;

const fetchDetails = async (slug: string): Promise<PostType> => {
  const { data } = await axios.get(`/api/posts/${slug}`);
  return data;
};

const fetchCurrentUser = async (): Promise<{ user: CurrentUser }> => {
  const response = await axios.get<{ user: CurrentUser }>(
    "/api/auth/currentUser",
  );
  return response.data;
};

export default function PostDetail({ params }: PageProps) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PostType>({
    queryKey: ["detail-post", slug],
    queryFn: () => fetchDetails(slug),
  });

  const { data: currentUserData } = useQuery<{ user: CurrentUser }>({
    queryFn: fetchCurrentUser,
    queryKey: ["currentUser"],
  });

  const currentUserId = currentUserData?.user?.id;

  if (isLoading) return <>Loading…</>;
  if (error || !data) return <>Not found</>;

  const avatar = data.user.image ?? "/default-avatar.png";
  const name = data.user.name ?? "Anonymous";

  return (
    <div>
      <Post
        id={data.id}
        name={name}
        avatar={avatar}
        postTitle={data.title}
        comments={data.comments}
        likes={data.likes}
        userId={data.user?.id}
        currentUserId={currentUserId}
      />

      {/* AddComment expects postId */}
      <AddComment postId={data.id} currentUserId={currentUserId} />

      {data.comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={data.id}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

// Comment Item Component with Like, Edit, Delete
type CommentItemProps = {
  comment: PostType["comments"][0];
  postId: string;
  currentUserId?: string;
};

function CommentItem({ comment, postId, currentUserId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(comment.message);
  const queryClient = useQueryClient();
  const toastId = useRef<string | undefined>(undefined);

  const isOwner = currentUserId && comment.userId === currentUserId;

  // Toggle like mutation
  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/posts/toggleCommentLike", {
        commentId: comment.id,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detail-post"] });
    },
    onError: () => {
      toast.error("Failed to like comment");
    },
  });

  // Delete mutation
  const deleteComment = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete("/api/posts/deleteComment", {
        data: { id: comment.id },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Comment deleted!", { id: toastId.current });
      queryClient.invalidateQueries({ queryKey: ["detail-post"] });
    },
    onError: () => {
      toast.error("Failed to delete comment", { id: toastId.current });
    },
  });

  // Edit mutation
  const editComment = useMutation({
    mutationFn: async (newMessage: string) => {
      const { data } = await axios.put("/api/posts/editComment", {
        id: comment.id,
        message: newMessage,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Comment updated!", { id: toastId.current });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["detail-post"] });
    },
    onError: () => {
      toast.error("Failed to update comment", { id: toastId.current });
    },
  });

  const handleLike = () => {
    if (!currentUserId) return;
    toggleLike.mutate();
  };

  const handleDelete = () => {
    toastId.current = toast.loading("Deleting comment...");
    deleteComment.mutate();
  };

  const handleEdit = () => {
    if (editedMessage.trim() === comment.message) {
      setIsEditing(false);
      return;
    }
    if (editedMessage.trim().length === 0) {
      toast.error("Message cannot be empty");
      return;
    }
    toastId.current = toast.loading("Updating comment...");
    editComment.mutate(editedMessage.trim());
  };

  const cancelEdit = () => {
    setEditedMessage(comment.message);
    setIsEditing(false);
  };

  const likeCount = comment.likes?.length ?? 0;
  const isLiked = currentUserId
    ? (comment.likes?.some((like) => like.userId === currentUserId) ?? false)
    : false;

  return (
    <motion.div
      key={comment.id}
      animate={{ opacity: 1, scale: 1 }}
      initial={{ opacity: 0, scale: 0.98 }}
      transition={{ ease: "easeOut", duration: 0.15 }}
      className="my-6 bg-white p-8 rounded-md"
    >
      <div className="flex items-center gap-2">
        <Image
          width={24}
          height={24}
          src={comment.user?.image ?? "/default-avatar.png"}
          alt={comment.user?.name ?? "avatar"}
          className="rounded-full"
        />
        <h3 className="font-bold">{comment.user?.name ?? "Anonymous"}</h3>
        <time className="text-sm text-gray-500" dateTime={comment.createdAt}>
          {new Date(comment.createdAt).toLocaleString()}
        </time>
      </div>

      {/* Comment message - editable */}
      <div className="py-4">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full p-2 border rounded-md resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={editComment.isPending}
                className="
                  flex items-center gap-1.5
                  text-sm font-semibold
                  text-white
                  px-3 py-1.5 rounded-md
                  transition-all duration-200
                  transform hover:scale-105
                  disabled:opacity-60 disabled:hover:scale-100
                  bg-gradient-to-r from-teal-500 to-teal-600
                  hover:from-teal-400 hover:to-teal-500
                "
              >
                {editComment.isPending ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </>
                )}
              </button>
              <button
                onClick={cancelEdit}
                className="
                  flex items-center gap-1.5
                  text-sm font-semibold
                  text-gray-600
                  px-3 py-1.5 rounded-md
                  transition-all duration-200
                  transform hover:scale-105
                  bg-gray-100 hover:bg-gray-200
                "
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="break-all">{comment.message}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 border-t pt-3">
        {/* Like button */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-all duration-200 hover:scale-105 active:scale-95 px-2 py-1 rounded-full hover:bg-red-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 transition-transform duration-200 ${isLiked ? "animate-pulse" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="font-semibold text-sm">{likeCount}</span>
        </button>

        {/* Edit and Delete buttons for owner */}
        {isOwner && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="
                flex items-center gap-1
                text-sm font-semibold
                px-2 py-1 rounded-md
                transition-all duration-200
                transform hover:scale-105
                bg-blue-100 text-blue-600
                hover:bg-blue-200 hover:text-blue-700
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="
                flex items-center gap-1
                text-sm font-semibold
                px-2 py-1 rounded-md
                transition-all duration-200
                transform hover:scale-105
                bg-red-100 text-red-600
                hover:bg-red-200 hover:text-red-700
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
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
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
