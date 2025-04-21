export class DocumentEntity {
  id!: string;
  userId!: string;
  title!: string;
  filePath!: string | null;
  fileSize!: number | null;
  mimeType!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}