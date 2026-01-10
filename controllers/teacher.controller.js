// Define your teacher controller methods here

export const getTeachers = (req, res) => {
  res.status(200).send('Get Teachers endpoint');
};

export const getTeacherById = (req, res) => {
  res.status(200).send(`Get Teacher with ID ${req.params.teacherId}`);
};