const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route   GET api/profile/me
// @desc    GET current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'There is no profile for this user' }] });
    }

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
      } else {
        // Create new profile
        profile = new Profile(profileFields);

        await profile.save();
      }

      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ errors: [{ msg: error.message }] });
    }
  }
);

// @route   GET api/profile
// @desc    Get all users profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.find().populate('user', ['name', 'avatar']);

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   GET api/profile/user/:id
// @desc    Get profile by userid
// @access  Public
router.get('/user/:id', async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.params.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile)
      return res.status(400).json({ errors: [{ msg: 'Profile not found!' }] });

    return res.status(200).json(profile);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ errors: [{ msg: 'Profile not found!' }] });

    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   DELETE api/profile
// @desc    Delete user, profile & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove users posts

    //Remove user profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    return res.status(200).json({ msg: 'User deleted!' });
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   PUT api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Job title is required')
        .not()
        .isEmpty(),
      check('company', 'Company name is required')
        .not()
        .isEmpty(),
      check('from', 'Job starting date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    // Build profile object
    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };
    /* newExperience.user = req.user.id;
    newExperience.experience = {};

    if (title) newExperience.experience.title = title;
    if (company) newExperience.experience.company = company;
    if (location) newExperience.experience.location = location;
    if (from) newExperience.experience.from = from;
    if (to) newExperience.experience.to = to;
    if (current) newExperience.experience.current = current;
    if (description) newExperience.experience.description = description; */

    try {
      let profile = await Profile.findOne({ user: req.user.id }).populate(
        'user',
        ['name', 'avatar']
      );
      profile.experience.unshift(newExperience);

      await profile.save();

      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ errors: [{ msg: error.message }] });
    }
  }
);

// @route   DELETE api/profile/experience/:id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:id', auth, async (req, res) => {
  try {
    //Remove profile experience
    let profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map(exp => exp.id)
      .indexOf(req.params.id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   PUT api/profile/education
// @desc    Add education to profile
// @access  Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      let profile = await Profile.findOne({ user: req.user.id }).populate(
        'user',
        ['name', 'avatar']
      );

      profile.education.unshift(newEducation);
      await profile.save();

      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ errors: [{ msg: error.message }] });
    }
  }
);

// @route   DELETE /api/profile/education/:id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:id', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    const removeIndex = profile.education
      .map(edu => edu.id)
      .indexOf(req.params.id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   GET /api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'gitClientId'
      )}&client_secret=${config.get('gitClientSecret')}`,
      method: 'GET',
      headers: { 'User-Agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) throw error;

      if (response.statusCode !== 200) {
        return res
          .status(response.statusCode)
          .json({ errors: { msg: 'no Github profile found!' } });
      }

      return res.status(200).json(JSON.parse(body));
    });
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

module.exports = router;
