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
                className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm disabled:opacity-60"
              >
                {editComment.isPending ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
              >
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
          className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span className="font-bold">{likeCount}</span>
        </button>

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
    </motion.div>
  );
}
