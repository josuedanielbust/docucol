export interface Message<T = any> {
  pattern: string;
  data: T;
  id?: string;
  timestamp?: number;
}
