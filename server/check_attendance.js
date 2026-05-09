import prisma from "./src/utils/prisma.js";

async function check() {
    try {
        const users = await prisma.user.findMany({
            where: { type: 'teacher' },
            include: { classTeacherCourse: true }
        });

        console.log("Teachers and their assigned courses:");
        users.forEach(u => {
            console.log(`- ${u.username} (ID: ${u.id}): ${u.classTeacherCourse ? u.classTeacherCourse.name : 'NONE'}`);
        });

        const courses = await prisma.course.findMany();
        console.log("\nAll Courses:");
        courses.forEach(c => {
            console.log(`- ${c.name} (ID: ${c.id}): Class Teacher ID: ${c.classTeacherId || 'NONE'}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
