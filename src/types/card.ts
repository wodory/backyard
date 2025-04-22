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
  cardTags?: Array<{ tag: { id: string; name: string; } }>;
}

export interface CreateCardInput {
  title: string;
  content?: string;
  userId: string;
  tags?: string[];
}

export interface UpdateCardInput {
  title?: string;
  content?: string;
  tags?: string[];
} 