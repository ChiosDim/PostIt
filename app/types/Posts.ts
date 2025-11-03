export type PostType = {
  id: string;
  title: string;
  user: {
    email: string;
    id: string;
    name: string;
    image: string;
  };
  comments: {
    id: string;
    userId: string;
    postId: string;
    title: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }[];
};
