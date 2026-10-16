// The services throw `new Error(await res.text())`, and Nest's error body is
// JSON like {"message":"...","error":"Forbidden","statusCode":403}, so the
// status code can be read back out of the error message.
export function getStatusCode(error: unknown): number | undefined {
  if (!(error instanceof Error)) return undefined;
  try {
    return JSON.parse(error.message)?.statusCode;
  } catch {
    return undefined;
  }
}

export function isForbiddenError(error: unknown): boolean {
  return getStatusCode(error) === 403;
}
