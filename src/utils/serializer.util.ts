export interface Serialized<T, K extends number = number> {
  data: T;
  status: K;
  message: string;
}

export function SerializeHttpResponse<T, K extends number = number>(
  data: T,
  status: K,
  message: string,
): Serialized<T, K> {
  return { data, status, message };
}
