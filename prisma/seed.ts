import { PrismaClient } from "../@prisma/client";
import { hash } from "bcryptjs";

require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Seed Email Categories
  await prisma.emailCategory.create({
    data: {
      name: "Marketing",
      description: "Email templates for marketing purposes.",
    },
  });

  await prisma.emailCategory.create({
    data: {
      name: "Transactional",
      description: "Email templates for transactional emails.",
    },
  });

  // Seed Teams
  const team = await prisma.team.create({
    data: {
      name: "Admin Team",
    },
  });

  // Seed Users
  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL,
      name: process.env.ADMIN_NAME,
      role: "ADMIN",
      status: "ACTIVE",
      teamId: team.id,
      password: await hash(process.env.ADMIN_PASSWORD, 10),
    },
  });

  // create a mailing list
  const lists = await prisma.mailingList.createMany({
    data: [
      {
        name: "Generic List",
        teamId: team.id,
      },
      {
        name: "Team Invites",
        teamId: team.id,
      },
    ],
  });

  // create a subscriber
  await prisma.subscriber.create({
    data: {
      email: process.env.ADMIN_EMAIL,
      firstName: process.env.ADMIN_NAME,
      lastName: "None",
      mailingList: {
        connect: {
          id: lists[0].id,
        },
      },
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
