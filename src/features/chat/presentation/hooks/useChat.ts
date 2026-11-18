import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { GetMessagesUseCase } from "@features/chat/application/use-cases/GetMessagesUseCase";
import { SendMessageUseCase } from "@features/chat/application/use-cases/SendMessageUseCase";
import { SubscribeToRoomUseCase } from "@features/chat/application/use-cases/SubscribeToRoomUseCase";
import {
  ChatImageAttachment,
  Message,
} from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const chatRepo = new SupabaseChatRepository();
const sendMessageUseCase = new SendMessageUseCase(chatRepo);
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
const subscribeUseCase = new SubscribeToRoomUseCase(chatRepo);

interface SendMessageInput {
  content: string;
  image?: ChatImageAttachment;
  previewUri?: string;
}

export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  const {
    data: messages = [],
    isLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    staleTime: 60_000,
  });

  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(
      roomId,
      (newMsg) => {
        setRealtimeError(null);
        queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => {
          const exists = old.some((message) => message.id === newMsg.id);
          return exists ? old : [...old, newMsg];
        });
      },
      (error) => setRealtimeError(error.message),
    );
    return unsubscribe;
  }, [queryClient, roomId]);

  const sendMutation = useMutation({
    mutationFn: ({ content, image }: SendMessageInput) =>
      sendMessageUseCase.execute(roomId, user!.id, content, image),
    onMutate: async ({ content, previewUri }) => {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        userId: user!.id,
        content,
        imageUrl: previewUri,
        createdAt: new Date(),
        authorUsername: user!.username,
      };
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => [
        ...old,
        tempMsg,
      ]);
      return { tempMsg };
    },

    onSuccess: (realMsg, _input, context) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => [
        ...old
          .filter((message) => message.id !== realMsg.id)
          .map((message) =>
            message.id === context?.tempMsg.id ? realMsg : message,
          ),
      ]);
    },

    onError: (_error, _input, context) => {
      if (context?.tempMsg) {
        queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
          old.filter((m) => m.id !== context.tempMsg.id),
        );
      }
    },
  });

  return {
    messages,
    sendMessage: sendMutation.mutate,
    isLoading,
    isSending: sendMutation.isPending,
    sendError:
      sendMutation.error?.message ??
      messagesError?.message ??
      realtimeError,
  };
}
