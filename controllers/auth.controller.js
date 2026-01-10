// Define your auth controller methods here

export const login = (req, res) => {
  res.status(200).send('Login endpoint');
};

export const logout = (req, res) => {
  res.status(200).send('Logout endpoint');
};

export const getMe = (req, res) => {
  res.status(200).send('Get Me endpoint');
};

export const refreshToken = (req, res) => {
  res.status(200).send('Refresh Token endpoint');
};