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
        const [result] = await db.query(`INSERT INTO user (email,username,password) VALUES (?,?,?)`,[email,username,password]);
        return result;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'User already exists' };
        }
        console.error("Error in saveUser:", error);
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

// export async function getUserData(username) {
//     try {
//         const data;
//         const [roles]=db.query(`SELECT u.id AS user_id,u.username AS user_name,r.id AS role_id,r.name AS role_name FROM user_roles ur JOIN user u ON ur.student_id = u.id JOIN roles r ON ur.role_id = r.id WHERE u.username = ?`, [username]); 
//         const [rows] = await db.query(`SELECT id, username, email FROM user WHERE username = ?`, [username]);
//         return rows[0];
//     } catch (error) {
//         console.error("Error in getUserData:", error);
//     }
// }

export async function getUserData(username) {
  try {
    // get roles for the user
    const [roles] = await db.query(
      `SELECT r.id AS role_id, r.name AS role_name
       FROM user_roles ur
       JOIN user u ON ur.student_id = u.id
       JOIN roles r ON ur.role_id = r.id
       WHERE u.username = ?`,
      [username]
    );

    // get user basic info
    const [rows] = await db.query(
      `SELECT id, username, email 
       FROM user 
       WHERE username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return null; // user not found
    }

    // concat data into one object
    const data = {
      ...rows[0],     // user info
      roles: roles    // array of roles
    };

    return data;
  } catch (error) {
    console.error("Error in getUserData:", error);
    throw error;
  }
}
