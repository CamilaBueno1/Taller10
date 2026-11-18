export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  imagePath?: string;
  imageUrl?: string;
  createdAt: Date;
  authorUsername?: string; // Desnormalización controlada para la UI
}

export interface ChatImageAttachment {
  data: ArrayBuffer;
  contentType: string;
  extension: "jpg" | "png" | "webp";
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}