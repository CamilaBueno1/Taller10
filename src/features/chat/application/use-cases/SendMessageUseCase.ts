import { ChatError } from "../../../../shared/domain/errors/AppError";
import {
  ChatImageAttachment,
  Message,
} from "../../domain/entities/Message";
import { IChatRepository } from "../../domain/repositories/IChatRepository";

export class SendMessageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}
  async execute(
    roomId: string,
    userId: string,
    content: string,
    image?: ChatImageAttachment,
  ): Promise<Message> {
    const trimmed = content.trim();
    if (!trimmed && !image) {
      throw new ChatError("Escribe un mensaje o selecciona una imagen");
    }
    if (trimmed.length > 500) throw new ChatError("Máximo 500 caracteres");
    return this.chatRepo.sendMessage(roomId, userId, trimmed, image);
  }
}