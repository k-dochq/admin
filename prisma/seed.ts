import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking AdminRole for specific user...');
  
  const user = await prisma.user.findFirst({
    where: { 
      email: 'jahun135@kakao.com' 
    },
    include: {
      UserRole: {
        include: {
          AdminRole: true
        }
      }
    }
  });

  console.log('user', JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Query failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
