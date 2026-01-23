import express from 'express';

const register = async (req, res) => {
  // Registration logic here
  res.send('User registered');
};
const login = async (req, res) => {
  // Login logic here
  res.send('User logged in');
};
const logout = async (req, res) => {
  // Logout logic here
  res.send('User logged out');
};



export {register, login, logout};