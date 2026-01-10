// Define your college controller methods here

export const getColleges = (req, res) => {
  res.status(200).send('Get Colleges endpoint');
};

export const createCollege = (req, res) => {
  res.status(200).send('Create College endpoint');
};

export const getCollegeCourses = (req, res) => {
  res.status(200).send(`Get Courses for College with ID ${req.params.collegeId}`);
};