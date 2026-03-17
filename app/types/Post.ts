// types/Post.ts
export type CommentUser = {
  id: string;
  name: string | null;
  image: string | null;
};

export type LikeType = {
  id: string;
  userId: string;
  postId: string | null;
  commentId: string | null;
  createdAt: string;
};

export type CommentType = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
  message: string;
  user: CommentUser;
  likes: LikeType[];
};

export type PostUser = {
  id: string;
  name: string | null;
  image: string | null;
};

export type PostType = {
  id: string;
  title: string;
  createdAt: string;
  user: PostUser;
  comments: CommentType[];
  likes: LikeType[];
};
