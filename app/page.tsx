"use client";
import axios from "axios";
import AddPost from "./components/AddPost";
import { useQuery } from "@tanstack/react-query";
import Post from "./components/Post";
import React from "react";
import type { PostType } from "./types/Post";

type CurrentUser = {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
} | null;

//Fetch all posts
const allPosts = async (): Promise<PostType[]> => {
  const response = await axios.get<PostType[]>("/api/posts/getPosts");
  return response.data;
};

//Fetch current user
const fetchCurrentUser = async (): Promise<{ user: CurrentUser }> => {
  const response = await axios.get<{ user: CurrentUser }>("/api/auth/currentUser");
  return response.data;
};

export default function Home() {
  const { data: postsData, error: postsError, isLoading: postsLoading } = useQuery<PostType[], Error>({
    queryFn: allPosts,
    queryKey: ["posts"],
  });

  const { data: currentUserData } = useQuery<{ user: CurrentUser }>({
    queryFn: fetchCurrentUser,
    queryKey: ["currentUser"],
  });

  const currentUser = currentUserData?.user;
  const currentUserId = currentUser?.id;

  if (postsError)
    return <div className="p-4 text-red-600">Error: {postsError.message}</div>;
  if (postsLoading) return <div className="p-4">Loading...</div>;

  return (
    <main>
      <AddPost />
      {postsData?.map((post: PostType) => (
        <Post
          comments={post.comments}
          likes={post.likes}
          key={post.id}
          name={post.user?.name ?? "Unknown"}
          avatar={post.user?.image ?? undefined}
          postTitle={post.title}
          id={post.id}
          userId={post.user?.id}
          currentUserId={currentUserId ?? undefined}
        />
      ))}
    </main>
  );
}
