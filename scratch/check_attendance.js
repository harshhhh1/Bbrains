import prisma from "server/src/utils/prisma.js";
async function check() {
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
    
    process.exit(0);
}

check();

Get-ChildItem -Recurse -File |
    Where-Object { $_.FullName -notmatch 'node_modules|\.git|\.next|package-lock\.json' } |
    ForEach-Object {
        $lineCount = (Get-Content $_.FullName | Measure-Object -Line).Lines
        if ($lineCount -gt 300) {
            "$($_.FullName) - $lineCount lines"
        }
    } | Out-File -FilePath "large_files.txt"
