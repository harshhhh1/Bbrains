// prisma/seed.js
// import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { UserRole, Sex, TransactionType, TransactionStatus } from "@prisma/client";
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

async function main() {
  prisma.$connect()
  // ---------- ADDRESS ----------
  const address = await prisma.address.create({
    data: {
      addressLine1: "123 Main St",
      city: "Mumbai",
      state: "MH",
      postalCode: "400001",
      country: "India",
    },
  });

  // ---------- COLLEGE ----------
  const college = await prisma.college.create({
    data: {
      name: "Demo College",
      email: "college@test.com",
      regNo: "REG123",
      addressId: address.id,
    },
  });

  // ---------- USERS ----------
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      username: "admin",
      password: "hashed_pw",
      type: UserRole.admin,
      collegeId: college.id,
      userDetails: {
        create: {
          firstName: "Admin",
          lastName: "User",
          sex: Sex.other,
          dob: new Date("1990-01-01"),
        },
      },
      wallet: { create: {} },
      xp: { create: { xp: 100, level: 2 } },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: "teacher@test.com",
      username: "teacher",
      password: "hashed_pw",
      type: UserRole.teacher,
      collegeId: college.id,
      userDetails: {
        create: {
          firstName: "Teach",
          lastName: "Er",
          sex: Sex.male,
          dob: new Date("1985-05-05"),
        },
      },
      wallet: { create: {} },
      xp: { create: { xp: 50 } },
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: "stud1@test.com",
      username: "student1",
      password: "hashed_pw",
      type: UserRole.student,
      collegeId: college.id,
      userDetails: {
        create: {
          firstName: "Stu",
          lastName: "Dent1",
          sex: Sex.female,
          dob: new Date("2004-03-10"),
        },
      },
      wallet: { create: {} },
      xp: { create: {} },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "stud2@test.com",
      username: "student2",
      password: "hashed_pw",
      type: UserRole.student,
      collegeId: college.id,
      userDetails: {
        create: {
          firstName: "Stu",
          lastName: "Dent2",
          sex: Sex.male,
          dob: new Date("2003-07-12"),
        },
      },
      wallet: { create: {} },
      xp: { create: {} },
    },
  });

  // ---------- COURSE ----------
  const course = await prisma.course.create({
    data: {
      name: "Intro to Programming",
      description: "Seeded course",
    },
  });

  // ---------- ENROLLMENTS ----------
  await prisma.enrollment.createMany({
    data: [
      { userId: student1.id, courseId: course.id },
      { userId: student2.id, courseId: course.id },
    ],
  });

  // ---------- ASSIGNMENT ----------
  const assignment = await prisma.assignment.create({
    data: {
      title: "Hello World",
      courseId: course.id,
      dueDate: new Date(),
    },
  });

  // ---------- SUBMISSION ----------
  await prisma.submission.create({
    data: {
      userId: student1.id,
      assignmentId: assignment.id,
      filePath: "/submissions/hw1.txt",
    },
  });

  // ---------- PRODUCT ----------
  const product = await prisma.product.create({
    data: {
      creatorId: admin.id,
      name: "Notebook",
      price: 50,
      stock: 100,
    },
  });

  // ---------- ORDER ----------
  const order = await prisma.order.create({
    data: {
      userId: student1.id,
      totalAmount: 50,
      items: {
        create: {
          productId: product.id,
          quantity: 1,
          price: 50,
        },
      },
    },
  });

  // ---------- TRANSACTION ----------
  await prisma.transactionHistory.create({
    data: {
      userId: student1.id,
      amount: 50,
      type: TransactionType.debit,
      status: TransactionStatus.success,
      note: "Purchase",
    },
  });

  console.log("🌱 Seeding complete");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());