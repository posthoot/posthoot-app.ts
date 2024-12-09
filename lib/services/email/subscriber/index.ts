import { prisma } from "@/app/lib/prisma";

export const getSubscriber = async (email: string, listId: string) => {
  return await prisma.subscriber
    .findFirst({
      where: {
        email,
        mailingList: {
          id: listId,
        },
      },
    })
    .then((subscriber) => {
      if (!subscriber) {
        throw new Error("Subscriber not found");
      }
      return subscriber;
    });
};
