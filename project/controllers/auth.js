const mysql = require("mysql");
const jwd = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


exports.login = async(req,res) =>{
    try {
        const{email,password } = req.body;

        if(!email || !password){
            return res.status(400).render('login' ,{
                messege: 'Please provide an email and pasword'
            })
        }

        db.query('SELECT * FROM users WHERE email = ?',[email], async(error,results) =>{
            console.log(results);
            if(!results || !(await bcrypt.compare(password,results[0].Password))){
                res.status(401).render('login',{
                    messege: 'Email or Passworrd is Incorrect'
                })
            }
            else{
                const id = results[0].id;
                const token = jwd.sign({id: id},process.env.JWT_SECRET,{
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log('the token is '+ token);
                /*const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60*1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt',token,cookieOptions);*/
                res.status(200).redirect('/');
            }
        })
    } catch (error) {
        console.log(error);
    }
}


exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordconfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                messege: 'email is already in use'
            });
        }
        else if (password != passwordconfirm) {
            return res.render('register', {
                messege: 'password does not match'
            });
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email: email ,password: hashedPassword}, (error,results) => {
            if(error){
                console.log(error);
            }
            else{
                console.log(results);
                return res.render('register', {
                    messege: 'User registered'
                });
            }
        });
    });

};


