export interface User {
  id: string;
  name: string | null;
}

export interface Card {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
}

export interface CreateCardInput {
  title: string;
  content?: string;
  userId: string;
}

export interface UpdateCardInput {
  title?: string;
  content?: string;
} 