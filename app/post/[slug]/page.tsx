"use client";

import Image from "next/image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Post from "../../components/Post";
import AddComment from "../../components/AddComment";
import type { PostType } from "../../types/Post";
import { use } from "react";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: unknown;
};

const fetchDetails = async (slug: string): Promise<PostType> => {
  const { data } = await axios.get(`/api/posts/${slug}`);
  return data;
};

export default function PostDetail({ params }: PageProps) {
  const { slug } = use(params);

  const { data, isLoading, error } = useQuery<PostType>({
    queryKey: ["detail-post", slug], // include slug in the key
    queryFn: () => fetchDetails(slug),
  });

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
      />

      {/* AddComment expects postId */}
      <AddComment postId={data.id} />

      {data.comments.map((comment) => (
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
            />
            <h3 className="font-bold">{comment.user?.name ?? "Anonymous"}</h3>
            <time
              className="text-sm text-gray-500"
              dateTime={comment.createdAt}
            >
              {new Date(comment.createdAt).toLocaleString()}
            </time>
          </div>
          <div className="py-4">{comment.message}</div>
        </motion.div>
      ))}
    </div>
  );
}
