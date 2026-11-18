import { Message } from "../../domain/entities/Message";
import { IChatRepository } from "../../domain/repositories/IChatRepository";

export class SubscribeToRoomUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}
  
  execute(
    roomId: string,
    onMessage: (msg: Message) => void,
    onError: (error: Error) => void,
  ): () => void {
    return this.chatRepo.subscribeToRoom(roomId, onMessage, onError);
  }
}