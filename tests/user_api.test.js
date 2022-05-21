const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');

const app = require('../app');
const User = require('../models/user');
const api = supertest(app);
const userList = [
    {
        name: 'user1',
        username: 'user1',
        password: 'abcd1234',
    },
    {
        name: 'user2',
        username: 'user2',
        password: 'abcd125534',
    },
    {
        name: 'user2',
        username: 'user2',
    },
    {
        name: 'user2',
        password: 'abcd125534',
    },
    {
        name: 'user2',
        username: 'us',
        password: 'abcd125534',
    },
    {
        name: 'user2',
        username: 'user2',
        password: 'ab',
    },
];

beforeEach(async () => {
    await User.deleteMany({});
    let userObject = new User(userList[0]);
    await userObject.save();
});

describe('addition of a new user', () => {
    test('post API work', async () => {
        const beforePost = await helper.usersInDb();
        await api.post('/api/users').send(userList[1]);
        const afterPost = await helper.usersInDb();

        expect(afterPost.length).toBe(beforePost.length + 1);
        expect(afterPost[afterPost.length - 1]).toHaveProperty('name', 'user2');
    });

    test('send http 400 when username duplicat', async () => {
        const response = await api.post('/api/users').send(userList[0]);
        expect(response.status).toEqual(400);
    });

    test('send http 400 when username or password missing', async () => {
        const response = await api.post('/api/users').send(userList[2]);
        expect(response.status).toEqual(400);
        const response2 = await api.post('/api/users').send(userList[3]);
        expect(response2.status).toEqual(400);
    });

    test('send http 400 when username or password length <3', async () => {
        const response = await api.post('/api/users').send(userList[4]);
        expect(response.status).toEqual(400);
        const response2 = await api.post('/api/users').send(userList[5]);
        expect(response2.status).toEqual(400);
    });
});

afterAll(() => {
    mongoose.connection.close();
});
