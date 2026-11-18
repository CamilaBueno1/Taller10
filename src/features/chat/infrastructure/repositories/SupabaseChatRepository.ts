import { supabase } from "@shared/infrastructure/supabase/client";
import {
  ChatImageAttachment,
  Message,
  Room,
} from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";

const CHAT_IMAGES_BUCKET = "chat-images";
const SIGNED_URL_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

export class SupabaseChatRepository implements IChatRepository {
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }

  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from("rooms")
      .insert({ name, created_by: userId })
      .select()
      .single();
    if (error) throw error;
    return this.mapRoom(data);
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("id, room_id, user_id, content, image_path, created_at, profiles(username)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw error;
    const rows = data ?? [];
    const signedUrls = await this.getSignedUrls(
      rows.flatMap((message) => (message.image_path ? [message.image_path] : [])),
    );
    return rows.map((message) =>
      this.mapMessage(message, signedUrls.get(message.image_path ?? "")),
    );
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    image?: ChatImageAttachment,
  ): Promise<Message> {
    let imagePath: string | null = null;

    if (image) {
      imagePath = `${userId}/${roomId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}.${image.extension}`;
      const { data, error } = await supabase.storage
        .from(CHAT_IMAGES_BUCKET)
        .upload(imagePath, image.data, {
          cacheControl: "3600",
          contentType: image.contentType,
          upsert: false,
        });
      if (error) throw error;
      imagePath = data.path;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        user_id: userId,
        content,
        image_path: imagePath,
      })
      .select(
        "id, room_id, user_id, content, image_path, created_at, profiles(username)",
      )
      .single();

    if (error) {
      if (imagePath) {
        const { error: cleanupError } = await supabase.storage
          .from(CHAT_IMAGES_BUCKET)
          .remove([imagePath]);
        if (cleanupError) {
          throw new Error(
            `${error.message}. No se pudo eliminar la imagen subida: ${cleanupError.message}`,
          );
        }
      }
      throw error;
    }

    const signedUrls = await this.getSignedUrls(
      imagePath ? [imagePath] : [],
    );
    return this.mapMessage(data, imagePath ? signedUrls.get(imagePath) : undefined);
  }

  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
    onError: (error: Error) => void,
  ): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          try {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", payload.new.user_id)
              .single();
            if (error) throw error;
            const imagePath = payload.new.image_path;
            const signedUrls = await this.getSignedUrls(
              imagePath ? [imagePath] : [],
            );
            onMessage(
              this.mapMessage(
                { ...payload.new, profiles: profile },
                imagePath ? signedUrls.get(imagePath) : undefined,
              ),
            );
          } catch (error) {
            onError(
              error instanceof Error
                ? error
                : new Error("No se pudo cargar el mensaje recibido."),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }

  private mapRoom = (raw: any): Room => ({
    id: raw.id,
    name: raw.name,
    createdBy: raw.created_by,
    createdAt: new Date(raw.created_at),
  });

  private getSignedUrls = async (
    paths: string[],
  ): Promise<Map<string, string>> => {
    const uniquePaths = [...new Set(paths)];
    if (uniquePaths.length === 0) return new Map();

    const { data, error } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .createSignedUrls(uniquePaths, SIGNED_URL_LIFETIME_SECONDS);
    if (error) throw error;

    const signedUrls = new Map<string, string>();
    for (const item of data ?? []) {
      if (item.error || !item.path || !item.signedUrl) {
        throw new Error(
          item.error ?? `No se pudo generar el enlace de ${item.path}.`,
        );
      }
      signedUrls.set(item.path, item.signedUrl);
    }

    if (signedUrls.size !== uniquePaths.length) {
      throw new Error("No se pudieron generar los enlaces de todas las imágenes.");
    }
    return signedUrls;
  };

  private mapMessage = (raw: any, imageUrl?: string): Message => {
    const imagePath = raw.image_path ?? undefined;
    return {
      id: raw.id,
      roomId: raw.room_id,
      userId: raw.user_id,
      content: raw.content,
      imagePath,
      imageUrl,
      createdAt: new Date(raw.created_at),
      authorUsername: raw.profiles?.username,
    };
  };
}
