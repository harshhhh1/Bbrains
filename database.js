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


export async function showAllUsers() {
    try{
        const [users]= await db.query(`Select id, username , email, created_at from user`)
        return users;
    }
    catch(error){
        console.error("Error listing users: ",error)
    }
}

export async function listUsers() { //blank
    
}

export async function checkUsername(username) {
    try {
        const [rows] = await db.query(`SELECT COUNT(*) as count FROM user where username=?`,[username]);
        return rows[0].count > 0;
    } catch (error) {
        console.error("Error in checkUsername:", error);
      
    }
}

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


export async function announcement(){
    try {
        const [annoncements]=await db.query('select id, OP, title, content from announcement')
        return annoncements;
    } catch (error) {
        console.error('error in getting announcement',error)
    }
}

export async function postAnnouncement(op, title, content){
    try {
        const [result] = await db.query(`INSERT INTO announcement (OP, title, content) VALUES (?, ?, ?)`, [op, title, content]);
        return result;
    } catch (error) {
        console.error('error in saving announcement',error)
    }
}

export async function updateAnnouncement(id, title, content){
    try {
        const [result] = await db.query(`UPDATE announcement SET title = ?, content = ? WHERE id = ?`, [title, content, id]);
        return result;
    } catch (error) {
        console.error('error in updating announcement',error)
    }
}

export async function getproducts(id){
    try {
        if(id){
            const result = await db.query(`select id, name, creator, description, price, stock from product where id =?`,[id]);
        }
        else{
            const result = await db.query(`select id, name, creator, description, price, stock from product`);
        }
    } catch (error) {
        console.error('error in getting products',error)
    }
}