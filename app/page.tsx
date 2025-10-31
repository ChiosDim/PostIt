"use client";
import axios from "axios";
import AddPost from "./components/AddPost";
import { useQuery } from "@tanstack/react-query";
import Post from "./components/Post";
import React from "react";
import type { PostType } from "./types/Post";

//Fetch all posts
const allPosts = async (): Promise<PostType[]> => {
  const response = await axios.get<PostType[]>("/api/posts/getPosts");
  return response.data;
};

export default function Home() {
  const { data, error, isLoading } = useQuery<PostType[], Error>({
    queryFn: allPosts,
    queryKey: ["posts"],
  });

  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <main>
      <AddPost />
      {data?.map((post: PostType) => (
        <Post
          comments={post.comments}
          key={post.id}
          name={post.user?.name ?? "Unknown"}
          avatar={post.user?.image ?? undefined}
          postTitle={post.title}
          id={post.id}
        />
      ))}
    </main>
  );
}
