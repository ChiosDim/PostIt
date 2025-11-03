"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import Toggle from "./Toggle";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import axios from "axios";
import toast from "react-hot-toast";

type EditProps = {
  id: string;
  avatar: string;
  name: string;
  title: string;
  comments?: {
    id: string;
    postId: string;
    userId: string;
  }[];
};

export default function EditPost({
  avatar,
  name,
  title,
  comments,
  id,
}: EditProps) {
  //Toggle
  const [toggle, setToggle] = useState(false);
  const deleteToastID = useRef<string | null>(null);
  const queryClient = useQueryClient();
  //Delete Post
  const { mutate } = useMutation<AxiosResponse, Error, string>({
    mutationFn: async (id: string) =>
      await axios.delete("/api/posts/deletePost", { data: { id } }),
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.", {
        id: deleteToastID.current ?? undefined,
      });
      deleteToastID.current = null;
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Post deleted successfully.", {
        id: deleteToastID.current ?? undefined,
      });
      deleteToastID.current = null;
      queryClient.invalidateQueries({ queryKey: ["auth-posts"] });
    },
    onSettled: () => {
      // ensure we don't keep a stale id
      deleteToastID.current = null;
    },
  });

  const deletePost = () => {
    deleteToastID.current = toast.loading("Deleting your post...");
    mutate(id);
  };

  return (
    <>
      <div className="bg-white my-8 p-8 rounded-lg">
        <div className="flex items-center gap-2">
          <Image width={32} height={32} src={avatar} alt="avatar" />
          <h3 className="font-bold text-gray-700">{name}</h3>
        </div>
        <div className="my-8">
          <p className="break-all">{title}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm font-bold text-gray-700">
            {comments?.length} Comments
          </p>
          <button
            onClick={() => setToggle(true)}
            className="text-sm font-bold text-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      {toggle && (
        <Toggle deletePostAction={deletePost} setToggleAction={setToggle} />
      )}
    </>
  );
}
