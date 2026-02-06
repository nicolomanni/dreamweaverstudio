export type PageTemplateType = 'story' | 'cover' | 'character' | 'other';
export type PageTemplateOrientation = 'portrait' | 'landscape' | 'square';
export type PageTemplateLayout = 'single' | 'grid' | 'custom';
export type PageTemplateResolutionTier = 'standard' | 'hd' | 'uhd';
export type PageTemplateStatus = 'active' | 'archived';

export type PageTemplate = {
  id: string;
  name: string;
  key?: string;
  description?: string;
  type?: PageTemplateType;
  orientation?: PageTemplateOrientation;
  aspectRatio?: string;
  layout?: PageTemplateLayout;
  rows?: number;
  cols?: number;
  panelCount?: number;
  gutter?: number;
  safeArea?: number;
  resolutionTier?: PageTemplateResolutionTier;
  status?: PageTemplateStatus;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
