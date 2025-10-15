import { afterAll, beforeAll, expect, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'


describe('Transactions routes', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })


    it('should be able to create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })
            .expect(201)
    });

    it('should be able to list all transactions', async () => {
        const postResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            });

        const cookies = postResponse.get('Set-Cookie') as string[];

        const response = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);
        console.log(response.body)
        expect(response.body).toHaveProperty('transactions');
        expect(response.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        ]
        );
        expect(Array.isArray(response.body.transactions)).toBe(true);

    });

});