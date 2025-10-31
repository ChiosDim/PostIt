export type PostType = {
  id: string;
  title: string;
  user: {
    name: string;
    image: string
  }
  createdAt: string;
  comment?:{
    id: string;
    userId: string;
    postId: string;
    createdAt: string;
  }[]
};
