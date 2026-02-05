export interface Panel {
  id: string;
  order: number;
  prompt: string;
  imageUrl?: string;
  negativePrompt?: string;
  caption?: string;
  dialogue?: string[];
  notes?: string;
}

export interface Page {
  id: string;
  pageNumber: number;
  panels: Panel[];
  title?: string;
  notes?: string;
}

export interface ComicProject {
  id: string;
  title: string;
  synopsis?: string;
  status?: 'draft' | 'in-progress' | 'completed';
  styleId?: string;
  pages: Page[];
  coverImageUrl?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
