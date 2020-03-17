const {check, validationResult} = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {Router} = require('express');
const bcrypt = require('bcryptjs');
const config = require('config');

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

         const hashedPassword = await bcrypt.hash(password, 12);
         const user = new User({ email, password: hashedPassword});

         await user.save();

         res.status(201).json({message: 'User Created'})

     }catch (e) {
         res.status(500).json({message: 'Register. Smth wrong'})
     }
});

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Entry correct email').normalizeEmail().isEmail(),
        check('password', 'Entry password').exists()
    ],
    async (req, res) =>{
        try{
            const errors = validationResult(req);

            if(!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Incorrect email, or password of login"
                })
            }

            const {email, password} = req.body;

            const user = await User.findOne({email});

            if(!user){
                return res.status(400).json({message: 'User with this email was not found'})
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch){
                return  res.status(400).json({ message: 'User with this password was not found'})
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            );

            res.json({ token, userId: user.id })
        }catch (e) {
            res.status(500).json({message: 'Register. Smth wrong'})
        }
});

module.exports = router;