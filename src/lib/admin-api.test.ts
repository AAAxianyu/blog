import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));
vi.mock('./auth', () => ({
  hasValidOrigin: vi.fn(),
  isAdminRequest: vi.fn(),
}));

import { revalidateBlogContent } from './admin-api';

describe('admin content revalidation', () => {
  beforeEach(() => {
    mocks.revalidatePath.mockClear();
  });

  it('revalidates every public article index after a mutation', () => {
    revalidateBlogContent();

    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/posts');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/archive');
  });
});
