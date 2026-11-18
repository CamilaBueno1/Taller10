import {
  ChatImageAttachment,
  Message,
  Room,
} from "../entities/Message";

export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  createRoom(name: string, userId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(
    roomId: string,
    userId: string,
    content: string,
    image?: ChatImageAttachment,
  ): Promise<Message>;
  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
    onError: (error: Error) => void,
  ): () => void;
}