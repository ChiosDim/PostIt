"use client";
import Image from "next/image";
import Link from "next/link";
import { PostType } from "../types/Post";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

type PostProps = {
  avatar?: string | null;
  name?: string | null;
  postTitle: string;
  id: string;
  comments?: PostType["comments"];
  likes?: PostType["likes"];
  userId?: string | null;
  currentUserId?: string;
};

export default function Post({
  avatar,
  name,
  postTitle,
  id,
  comments,
  likes = [],
  userId,
  currentUserId,
}: PostProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(postTitle);
  const queryClient = useQueryClient();
  const toastId = useRef<string | undefined>(undefined);

  // Check if current user is the owner
  const isOwner = currentUserId && userId && currentUserId === userId;
  const isLoggedIn = !!session;

  // Like mutation
  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/posts/toggleLike", {
        postId: id,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["detail-post"] });
    },
    onError: () => {
      toast.error("Failed to like post");
    },
  });

  // Delete mutation
  const deletePost = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete("/api/posts/deletePost", {
        data: { id },
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted!", { id: toastId.current });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to delete post", { id: toastId.current });
    },
  });

  // Edit mutation
  const editPost = useMutation({
    mutationFn: async (newTitle: string) => {
      const { data } = await axios.put("/api/posts/editPost", {
        id,
        title: newTitle,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Post updated!", { id: toastId.current });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["detail-post"] });
    },
    onError: () => {
      toast.error("Failed to update post", { id: toastId.current });
    },
  });

  const handleLike = () => {
    if (!isLoggedIn) {
      // Sign in required
      return;
    }
    toastId.current = undefined;
    toggleLike.mutate();
  };

  const handleDelete = () => {
    if (!isLoggedIn) return;
    toastId.current = toast.loading("Deleting post...");
    deletePost.mutate();
  };

  const handleEdit = () => {
    if (!isLoggedIn) return;
    if (editedTitle.trim() === postTitle) {
      setIsEditing(false);
      return;
    }
    if (editedTitle.trim().length === 0) {
      toast.error("Title cannot be empty");
      return;
    }
    toastId.current = toast.loading("Updating post...");
    editPost.mutate(editedTitle.trim());
  };

  const cancelEdit = () => {
    setEditedTitle(postTitle);
    setIsEditing(false);
  };

  const avatarSrc = avatar || "https://ui-avatars.com/api/?name=User";
  const likeCount = likes?.length ?? 0;
  const isLiked = currentUserId
    ? (likes?.some((like) => like.userId === currentUserId) ?? false)
    : false;

  return (
    <div className="bg-white my-4 sm:my-8 p-4 sm:p-8 rounded-lg shadow-md">
      <div className="flex items-center gap-2 sm:gap-3">
        <Image
          className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
          width={40}
          height={40}
          src={avatarSrc}
          alt="avatar"
          priority
        />
        <h3 className="font-bold text-sm sm:text-base text-gray-700 truncate">
          {name}
        </h3>
      </div>
      <div className="my-4 sm:my-8">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded-md resize-none text-sm sm:text-base"
              rows={3}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleEdit}
                disabled={editPost.isPending}
                className="
                  flex items-center gap-1.5
                  text-sm font-semibold
                  text-white
                  px-4 py-1.5 rounded-md
                  transition-all duration-200
                  transform hover:scale-105
                  disabled:opacity-60 disabled:hover:scale-100
                  bg-gradient-to-r from-teal-500 to-teal-600
                  hover:from-teal-400 hover:to-teal-500
                "
              >
                {editPost.isPending ? (
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
                  px-4 py-1.5 rounded-md
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
          <p className="break-all">{postTitle}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4 cursor-pointer items-center">
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
            className="w-5 h-5 transition-transform duration-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="text-sm font-semibold">{likeCount}</span>
        </button>

        <Link href={`/post/${id}`}>
          <p className="text-xs sm:text-sm font-bold text-gray-700">
            {comments?.length ?? 0} Comments
          </p>
        </Link>

        {/* Edit and Delete buttons for owner */}
        {isOwner && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="
                flex items-center gap-1.5
                text-sm font-semibold
                px-3 py-1.5 rounded-md
                transition-all duration-200
                transform hover:scale-105
                bg-blue-100 text-blue-600
                hover:bg-blue-200 hover:text-blue-700
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="
                flex items-center gap-1.5
                text-sm font-semibold
                px-3 py-1.5 rounded-md
                transition-all duration-200
                transform hover:scale-105
                bg-red-100 text-red-600
                hover:bg-red-200 hover:text-red-700
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
