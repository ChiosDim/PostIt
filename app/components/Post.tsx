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
    <div className="bg-white my-8 p-8 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <Image
          className="rounded-full"
          width={32}
          height={32}
          src={avatarSrc}
          alt="avatar"
          priority
        />
        <h3 className="font-bold text-gray-700">{name}</h3>
      </div>
      <div className="my-8">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={editPost.isPending}
                className="bg-teal-600 text-white px-4 py-1 rounded-md text-sm disabled:opacity-60"
              >
                {editPost.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-1 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="break-all">{postTitle}</p>
        )}
      </div>
      <div className="flex gap-4 cursor-pointer items-center">
        {/* Like button */}
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-700 hover:text-red-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="text-sm font-bold">{likeCount}</span>
        </button>

        <Link href={`/post/${id}`}>
          <p className="text-sm font-bold text-gray-700">
            {comments?.length ?? 0} Comments
          </p>
        </Link>

        {/* Edit and Delete buttons for owner */}
        {isOwner && (
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-sm font-bold text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
