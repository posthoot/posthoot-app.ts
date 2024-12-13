import { prisma } from "@/app/lib/prisma";
import { isEmpty, removeUndefined } from "@/lib/utils";
import { SignupInput } from "@/lib/validations/auth";
import { User } from "@/@prisma/client";
import { hashSync } from "bcrypt-edge";

export const register = async (body: SignupInput): Promise<{ user: User }> => {
  const exists = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (exists) {
    throw new Error("Email already exists");
  }

  const hashedPassword = hashSync(body.password, 10);

  // Create user and team in a single transaction for atomicity
  const { user } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: removeUndefined({
        email: body.email,
        password: hashedPassword,
        name: body.name,
        role: body.role,
        team: body.teamId
          ? {
              connect: {
                id: body.teamId,
              },
            }
          : undefined,
      }),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (isEmpty(body.teamId)) {
      const team = await tx.team.create({
        data: {
          name: body.name,
          users: {
            connect: {
              id: user.id,
            },
          },
          lists: {
            createMany: {
              data: [
                {
                  name: "Generic",
                  description: "Generic list for all users",
                },
                {
                  name: "Team Invites",
                  description: "Team invites list",
                },
              ],
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Update user with team ID in same transaction
      await tx.user.update({
        where: { id: user.id },
        data: { team: { connect: { id: team.id } } },
      });

      return { user };
    } else {
      return { user };
    }
  });

  return { user: user as User };
};
