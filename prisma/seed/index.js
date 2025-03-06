const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 사용자 생성
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        cards: {
          create: [
            {
              title: '시작하기',
              content: '백야드 프로젝트에 오신 것을 환영합니다!'
            }
          ]
        }
      }
    });
    
    // 태그 생성
    const welcomeTag = await prisma.tag.upsert({
      where: { name: '환영' },
      update: {},
      create: { name: '환영' }
    });
    
    // 카드-태그 연결
    const cards = await prisma.card.findMany({
      where: { userId: user.id }
    });
    
    if (cards.length > 0) {
      await prisma.cardTag.upsert({
        where: {
          cardId_tagId: {
            cardId: cards[0].id,
            tagId: welcomeTag.id
          }
        },
        update: {},
        create: {
          cardId: cards[0].id,
          tagId: welcomeTag.id
        }
      });
    }
    
    console.log('Database seeded!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 