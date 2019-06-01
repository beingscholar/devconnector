const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const { check, validationResult } = require('express-validator/check');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    GET current user
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
  // res.send('Auth route');
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/',
  [
    // email is unique
    check('email', 'Enter a valid email address').isEmail(),

    // password is required
    check('password').exists()
  ],
  async (req, res) => {
    // console.log(req.body);

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      // Check if user not exists
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // check user password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      // return the jsonwebtoken
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (error, token) => {
          if (error) throw error;

          res.status(200).json({ token });
        }
      );

      // res.send('User registered');
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ errors: [{ msg: errors.message }] });
    }
  }
);

module.exports = router;
