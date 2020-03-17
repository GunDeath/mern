const {check, validationResult} = require('express-validator');
const hash_password = require('bcryptjs');
const User = require('../models/User');
const {Router} = require('express');

const router = Router();


// /api/auth/register
router.post(
        '/register',
        [
            check('email', 'Incorrect email').isEmail(),
            check('password', 'Incorrect password').isLength({min: 6})
        ],
        async (req, res) =>{
     try{

         const errors = validationResult(req);

         if(!errors.isEmpty()){
             return res.status(400).json({
                 errors: errors.array(),
                 message: "Incorrect email, or password of register"
             })
         }

         const {email, password} = req.body;

         const candidate = await User.findOne({email});

         if(candidate){
            return  res.status(400).json({message: "User with this email already been created"})
         }

         const hashedPassword = await hash_password.hash(password, 12);
         const user = new User({ email, password: hashedPassword});

         await user.save();

         res.status(201).json({message: 'User Created'})

     }catch (e) {
         res.status(500).json({message: 'Register. Smth wrong'})
     }
});

// /api/auth/login
router.post('/login', async (req, res) =>{

});

module.exports = router;