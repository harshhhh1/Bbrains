import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt'
import mysql from 'mysql2';

const db = mysql.createPool(
    {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_NAME
    }
).promise()

export async function saveUser(email,username,password) {
    try {
        const [result] = await db.query(`INSERT INTO user (email,username,password) VALUES (?,?,?)`,[email,username,password]);
        return result;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'User already exists' };
        }
        console.error("Error in saveUser:", error);
    }
}


export async function showAllUsers() {
    try{
        const [users]= await db.query(`Select id, username , email, created_at from user`)
        return users;
    }
    catch(error){
        console.error("Error listing users: ",error)
    }
}

export async function listUsers() {
    
}

export async function checkUsername(username) {
    try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM user where username=?`,[username]);
        return rows[0].count > 0;
    } catch (error) {
        console.error("Error in checkUsername:", error);
      
    }
}

export async function signup(email,username,password) {
        try {
        
    } catch (error) {
        
    }
}
export async function login(username,password) {
    try {
        const [rows] = await db.query(`SELECT password FROM user where username=?`,[username]);
        if (rows.length === 0) {
            return false; 
        }
        const hashedPassword = rows[0].password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log(isMatch)
        return isMatch;
    } catch (error) {
        console.error("Error in login:", error); 
    }
}

export async function getUserData(username) {
    try {
        const [rows] = await db.query(`SELECT id, username, email FROM user WHERE username = ?`, [username]);
        return rows[0];
    } catch (error) {
        console.error("Error in getUserData:", error);
    }
}