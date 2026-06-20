export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  defaultSlaHours: number;
  isActive: boolean;
};

export type CreateCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  defaultSlaHours?: number;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload> & { isActive?: boolean };

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  defaultSlaHours?: number;
};