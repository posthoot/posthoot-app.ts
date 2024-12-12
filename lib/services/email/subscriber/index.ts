import { prisma } from "@/app/lib/prisma";
import { isEmpty, removeUndefined } from "@/lib/utils";

export const getSubscriber = async (
  email: string,
  teamId: string,
  listId?: string | null,
  fallbackListName?: string | null
) => {
  if (!listId && !fallbackListName) {
    throw new Error("Either listId or fallbackListName must be provided");
  }

  const req = removeUndefined({
    email,
    mailingList: !isEmpty(listId) ? { id: listId } : undefined,
  });

  const subscriber = await prisma.subscriber.findFirst({
    where: req,
  });

  if (!subscriber) {
    console.log("creating subscriber");
    return prisma.subscriber.create({
      data: {
        email,
        mailingList: {
          connect: {
            id: (
              await prisma.mailingList.findFirst({
                where: { name: fallbackListName },
              })!
            ).id,
          },
        },
      },
    });
  }

  return subscriber;
};
