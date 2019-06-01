const express = require('express');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      const post = await new Post(newPost).save();

      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ errors: { msg: error.message } });
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdOn: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(400).json({ errors: [{ msg: 'Post not found!' }] });

    return res.status(200).json(post);
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ errors: [{ msg: 'Post not found!' }] });

    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post)
      return res.status(400).json({ errors: [{ msg: 'Post not found!' }] });

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ errors: [{ msg: 'Unauthorized: Access is denied!' }] });
    }
    await post.remove();

    return res.status(200).json({ msg: 'Post removed!' });
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ errors: [{ msg: 'Post not found!' }] });

    return res.status(500).json({ errors: [{ msg: error.message }] });
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ errors: [{ msg: 'Post already liked' }] });
    } else if (post.user.toString() === req.user.id) {
      return res
        .status(400)
        .json({ errors: [{ msg: "You can't like your own post" }] });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.status(200).json(post.likes);
  } catch (error) {
    return res.status(500).json({ errors: { msg: error.message } });
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by this user
    if (post.user.toString() === req.user.id) {
      return res
        .status(400)
        .json({ errors: [{ msg: "You can't dislike your own post" }] });
    } else if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Post has not yet been liked' }] });
    }

    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    return res.status(200).json({ msg: 'Post like removed' });
  } catch (error) {
    return res.status(500).json({ errors: { msg: error.message } });
  }
});

// @route   POST api/posts/comment/:id
// @desc    Create post comments
// @access  Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar
      };

      post.comments.unshift(newComment);

      await post.save();

      return res.status(200).json(post.comments);
    } catch (error) {
      return res.status(500).json({ errors: { msg: error.message } });
    }
  }
);

// @route   DELETE api/posts/comment/:id/:cmnt_id
// @desc    Delete post comments
// @access  Private
router.delete('/comment/:id/:cmnt_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment from the post
    const comment = post.comments.find(
      comment => comment.id === req.params.cmnt_id
    );

    // Make sure comment exists
    if (!comment) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Comment does not exists!' }] });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ errors: [{ msg: 'Unauthorized: Access is denied!' }] });
    }

    const removeIndex = post.comments
      .map(comment => comment.id)
      .indexOf(req.params.cmnt_id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    return res.status(200).json({ msg: 'Comment removed!' });
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res
        .status(400)
        .json({ errors: [{ msg: 'Comment does not exists!' }] });

    return res.status(500).json({ errors: { msg: error.message } });
  }
});

module.exports = router;
