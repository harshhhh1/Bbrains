// Define your attendance controller methods here

export const createAttendance = (req, res) => {
  res.status(200).send('Create Attendance endpoint');
};

export const getAttendanceByStudent = (req, res) => {
  res.status(200).send(`Get Attendance for Student with ID ${req.params.studentId}`);
};

export const getAttendanceBySubject = (req, res) => {
  res.status(200).send(`Get Attendance for Subject with ID ${req.params.subjectId}`);
};