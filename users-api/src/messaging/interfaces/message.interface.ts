export interface Message<T = any> {
  pattern: string;
  data: T;
  id?: string;
  timestamp?: number;
}

export interface UserCreatedEvent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface UserUpdatedEvent {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  updatedAt: Date;
}

export interface UserDeletedEvent {
  id: string;
  deletedAt: Date;
}
