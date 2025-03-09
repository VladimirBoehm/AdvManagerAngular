export interface ResponseWrapper<T> {
  data: T;
  messages: string[];
  isSuccessful: boolean;
}
