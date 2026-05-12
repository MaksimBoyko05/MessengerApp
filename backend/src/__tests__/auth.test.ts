import {describe, it, expect} from 'vitest';
import request from 'supertest';
import {app} from '../index.js';

describe('Авторизація (Integration Tests)', () => {

    it('Має повертати помилку (400 або 401), якщо відправити порожні дані при логіні', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
    });

    it('Має повертати 404 для неіснуючих роутів', async () => {
        const response = await request(app).get('/api/auth/this-route-does-not-exist');
        expect(response.status).toBe(404);
    });

});