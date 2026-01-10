// Define your student controller methods here

export const getStudents = (req, res) => {
  res.status(200).send('Get Students endpoint');
};

export const getStudentById = (req, res) => {
  res.status(200).send(`Get Student with ID ${req.params.studentId}`);
};

export const updateStudent = (req, res) => {
  res.status(200).send(`Update Student with ID ${req.params.studentId}`);
};

export const addStudentBadge = (req, res) => {
  res.status(200).send(`Add Badge to Student with ID ${req.params.studentId}`);
};