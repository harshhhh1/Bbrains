// import express from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import prisma from '../utils/prisma.js';

// const getuserdata = async (req, res) => {
//     // Logic to get user data for dashboard
//     try {
//         const token = req.cookies.token;
//         if (!token) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decoded.id;

//         const user = await prisma.user.findUnique({
//             where: { id: userId },
//             include: {
//                 userDetails: {
//                     include: {
//                         address: true
//                     }
//                 },
//                 college: true,
//                 roles: {
//                     include: {
//                         role: true
//                     }
//                 },
//                 wallet: true,
//                 xp: true
//             }
//         });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const userData = {
//             name: user.userDetails ? `${user.userDetails.firstName} ${user.userDetails.lastName}` : user.username,
//             username: user.username,
//             email: user.email,
//             roles: user.roles.map(ur => ur.role.name),
//             address: user.userDetails?.address ?
//                 `${user.userDetails.address.addressLine1}, ${user.userDetails.address.city}, ${user.userDetails.address.state || ''}, ${user.userDetails.address.country}`
//                 : 'No address provided',
//             collegename: user.college?.name || 'Unknown College',
//             coins: user.wallet?.balance || 0,
//             xp: user.xp?.xp || 0,
//             level: user.xp?.level || 0
//         };

//         return res.status(200).json(userData);
//     }
//     catch (error) {
//         console.error(error);
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({ message: 'Invalid token' });
//         }
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// }

// export {getuserdata};