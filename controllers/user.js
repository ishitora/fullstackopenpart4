const bcrypt = require('bcrypt');

const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({}).populate('blogs', {
            title: 1,
            author: 1,
            url: 1,
            id: 1,
        });
        response.json(users);
    } catch (error) {
        next(error);
    }
});

usersRouter.post('/', async (request, response, next) => {
    try {
        const { username, name, password } = request.body;

        if (!username || !password) {
            throw new Error('most have username and password');
        }
        if (username.length < 3 || password.length < 3) {
            throw new Error(
                'username or password must be at least 3 characters'
            );
        }

        const duplicateUser = await User.findOne({ username });

        if (duplicateUser) {
            throw new Error('The username must be unique');
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const user = new User({
            username,
            name,
            passwordHash,
        });

        const savedUser = await user.save();

        response.status(201).json(savedUser);
    } catch (error) {
        next(error);
    }
});

module.exports = usersRouter;
