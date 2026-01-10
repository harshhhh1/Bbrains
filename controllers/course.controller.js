// Define your course controller methods here

export const getCourses = (req, res) => {
  res.status(200).send('Get Courses endpoint');
};

export const createCourse = (req, res) => {
  res.status(200).send('Create Course endpoint');
};

export const getCourseSubjects = (req, res) => {
  res.status(200).send(`Get Subjects for Course with ID ${req.params.courseId}`);
};