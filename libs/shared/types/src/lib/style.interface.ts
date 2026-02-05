export type ComicStyle = {
  id: string;
  name: string;
  key?: string;
  description?: string;
  status?: 'active' | 'archived';
  isDefault?: boolean;
  previewImageUrl?: string;
  visualStyle?: {
    styleName?: string;
    medium?: string;
    lineart?: string;
    coloring?: string;
    lighting?: string;
    anatomy?: string;
  };
  systemPrompt?: string;
  promptTemplate?: string;
  technicalTags?: string;
  negativePrompt?: string;
  continuityRules?: string;
  formatGuidelines?: string;
  interactionLanguage?: string;
  promptLanguage?: string;
  safety?: {
    sfwOnly?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};
