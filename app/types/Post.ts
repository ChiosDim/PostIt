// types/Post.ts
export type CommentUser = {
  id: string;
  name: string | null;
  image: string | null;
};

export type CommentType = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string; 
  message: string;
  user: CommentUser; 
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
};
