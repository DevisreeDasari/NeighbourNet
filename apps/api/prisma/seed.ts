import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.createMany({
    data: [
      { name: "Aarav Mehta", email: "aarav@example.com", phone: "+919900000001", passwordHash, colony: "Andheri West", pincode: "400053", city: "Mumbai", coinBalance: 12, trustScore: 4.7 },
      { name: "Diya Sharma", email: "diya@example.com", phone: "+919900000002", passwordHash, colony: "Indiranagar", pincode: "560038", city: "Bangalore", coinBalance: 8, trustScore: 4.9, isVerified: true, verificationStatus: "VERIFIED" },
      { name: "Kabir Singh", email: "kabir@example.com", phone: "+919900000003", passwordHash, colony: "Saket", pincode: "110017", city: "Delhi", coinBalance: 5, trustScore: 4.2 }
    ],
    skipDuplicates: true
  });

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true
    }
  });
  const userByEmail: Map<string, { id: string; email: string }> = new Map(
    allUsers.map((u: { id: string; email: string }) => [u.email, u] as const)
  );

  const skillsData = [
    {
      email: "diya@example.com",
      title: "Yoga for beginners",
      description: "Gentle yoga sessions focused on flexibility and stress relief.",
      category: "Health & Wellness",
      tags: ["yoga", "stretching", "breathing"],
      proficiency: "Expert",
      coinsPerHour: 1
    },
    {
      email: "aarav@example.com",
      title: "React debugging help",
      description: "Pair-program and fix bugs in your React app. Best practices included.",
      category: "Tech & Coding",
      tags: ["react", "typescript", "debugging"],
      proficiency: "Intermediate",
      coinsPerHour: 1
    },
    {
      email: "kabir@example.com",
      title: "Home electrical basics",
      description: "Help with basic electrical troubleshooting (switches, minor wiring checks).",
      category: "Home Repair",
      tags: ["electrical", "repair"],
      proficiency: "Intermediate",
      coinsPerHour: 1
    }
  ];

  for (const s of skillsData) {
    const u = userByEmail.get(s.email);
    if (!u) continue;

    const existing = await prisma.skill.findFirst({
      where: {
        userId: u.id,
        title: s.title
      }
    });

    if (existing) continue;

    await prisma.skill.create({
      data: {
        userId: u.id,
        title: s.title,
        description: s.description,
        category: s.category,
        tags: s.tags,
        proficiency: s.proficiency,
        coinsPerHour: s.coinsPerHour
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
