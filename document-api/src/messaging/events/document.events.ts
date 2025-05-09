export interface DocumentEvent {
  id: string;
  eventTimestamp: number;
  userId: string;
}

export interface DocumentUploadedEvent extends DocumentEvent {
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentDeletedEvent extends DocumentEvent {
  title?: string;
}

export interface DocumentProcessingEvent extends DocumentEvent {
  status: 'started' | 'completed' | 'failed';
  processingType: string;
  result?: any;
  error?: string;
}
