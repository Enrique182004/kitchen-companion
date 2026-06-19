import { vi } from "vitest";

export const mockSingle = vi.fn();
export const mockOrder = vi.fn();
export const mockEq = vi.fn();
export const mockIn = vi.fn();
export const mockSelect = vi.fn();
export const mockInsert = vi.fn();
export const mockUpdate = vi.fn();
export const mockDelete = vi.fn();

const chain = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  in: mockIn,
  order: mockOrder,
  single: mockSingle,
};

// Each mock returns `this` (the chain) so calls can be chained
Object.values(chain).forEach((fn) => fn.mockReturnThis());

export const supabase = {
  from: vi.fn(() => chain),
};

vi.mock("@/lib/supabase", () => ({ supabase }));
