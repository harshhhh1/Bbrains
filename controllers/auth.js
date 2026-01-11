import bcrypt from 'bcrypt'
import validator from 'validator'
import {} from '../database.js';


export const signup = async (req, res) => {
    try {
        const { email, username, password, confirmpassword } = req.body;
        if (!email || !username || !password || !confirmpassword) {
            return res.status(400).send('All fields are required');
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send('Invalid email format');
        }
        if (password !== confirmpassword) {
            return res.status(400).send('Passwords do not match');
        }
        // const userExists = await checkUsername(username);
        // if (userExists) {
        //     return res.status(400).send('Username already taken');
        // }
        const hashedPassword = await bcrypt.hash(password, 10);
        // const result = await saveUser(email, username, hashedPassword);
        // if (result && result.success) {
        //     return res.status(201).send('Signup successful');
        // } else {
        //     return res.status(500).send('Error during signup');
        // }
        console.log(hashedPassword)
    } catch (error) {
        console.error("Error in signup:", error);
    }
    
};



export const signin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const isValidUser = await checkLoginDetails(username, password);
    if (!isValidUser) {
        return res.status(400).send('Invalid credentials');
    }
    return res.status(200).send('Login successful');
    res.redirect('/dashboard');
}

// export const showallusers = async (req, res) => {
//     res.send(showAllUsers())
// }

