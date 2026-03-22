interface ClerkLikeError {
  errors?: Array<{
    message?: string;
    longMessage?: string;
  }>;
}

export function getClerkErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const clerkError = error as ClerkLikeError;
    const firstError = clerkError.errors?.[0];

    if (firstError?.longMessage) {
      return firstError.longMessage;
    }

    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
