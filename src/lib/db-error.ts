export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

export function isDatabaseUnavailableError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("prismaclientinitializationerror") ||
    message.includes("can't reach database server") ||
    message.includes("failed to connect") ||
    message.includes("connection refused") ||
    message.includes("connection terminated") ||
    message.includes("timed out") ||
    message.includes("server closed the connection")
  );
}

export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string
) {
  try {
    return await operation();
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    console.error(`[db-unavailable] ${context}`, error);
    return fallback;
  }
}
