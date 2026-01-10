// Define your user controller methods here

export const getUsers = (req, res) => {
  res.status(200).send('Get Users endpoint');
};

export const getUserById = (req, res) => {
  res.status(200).send(`Get User with ID ${req.params.userId}`);
};

export const updateUser = (req, res) => {
  res.status(200).send(`Update User with ID ${req.params.userId}`);
};

export const deleteUser = (req, res) => {
  res.status(200).send(`Delete User with ID ${req.params.userId}`);
};