import prisma from "../utils/prisma.js";
import { PrismaPg } from "@prisma/adapter-pg";

async function seedColleges() {
  await prisma.college.deleteMany();
  const colleges = [
    { name: 'MIT', address: 'Cambridge, MA', email: 'admin@mit.edu', regNo: 'MIT001' },
    { name: 'Stanford', address: 'Palo Alto, CA', email: 'admin@stanford.edu', regNo: 'STAN001' },
    { name: 'Tilak Maharashtra Vidyapeth', address: 'Pune, India', email: 'admin@tmv.ac.in', regNo: 'TMVB001' }
  ];
  await prisma.college.createMany({ data: colleges });
  console.log('✅ Seeded 3 colleges');
}
async function seedRoles() {
  await prisma.role.deleteMany();
  const roles = [
    { name: 'Super Admin', description: 'Full platform access' },
    { name: 'College Admin', description: 'College management' },
    { name: 'Teacher', description: 'Course instructor' },
    { name: 'Student', description: 'Learner' }
  ];
  await prisma.role.createMany({ data: roles });
  console.log('✅ Seeded 4 roles');
}
async function seedCourses() {
  // First get a college
  const college = await prisma.college.findFirst();

  await prisma.course.deleteMany();
  const courses = [
    { name: 'Web Development', description: 'Full-stack development' },
    { name: 'Data Structures', description: 'Advanced algorithms' },
    { name: 'Database Systems', description: 'SQL and NoSQL' }
  ];
  await prisma.course.createMany({ data: courses });
  console.log('✅ Seeded 3 courses');
}

async function main() {
  console.log('🌱 Seeding levels...');

  // Generate 100 levels with exponential XP growth
  // Level 1: 0 XP, Level 2: 100, Level 3: 220, Level 4: 360...
  const levels = [];

  for (let i = 1; i <= 100; i++) {
    // Formula: 100 * i * log(i + 1) for smooth exponential curve
    const requiredXp = Math.floor(100 * i * Math.log(i + 1) * 1.2);
    levels.push({
      levelNumber: i,
      requiredXp: requiredXp.toString() // Prisma Decimal as string
    });
    console.log(`- Level ${i}: ${requiredXp} XP`);
  }

  // Clear existing levels
  await prisma.level.deleteMany();
  console.log('🗑️  Cleared existing levels');

  // Bulk insert all levels
  await prisma.level.createMany({
    data: levels
  });

  console.log(`✅ Seeded ${levels.length} levels!`);

  await seedColleges();
  await seedRoles();
  await seedCourses();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });