export function removeUndefinedFields<T extends object>(dto: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(dto).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
  }
  