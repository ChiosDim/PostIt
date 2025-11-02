export type AuthPosts = {
  email: string;
  id: string;
  name: string;
  image: string;
  posts: {
    createdAt: string;
    id: string;
    title: string;
    comments?: {
      createdAt: string;
      id: string;
      postId: string;
      title: string;
      userId: string;
    }[];
  }[];
};
