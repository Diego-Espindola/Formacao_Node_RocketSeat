import { afterAll, beforeAll, expect, describe, it, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'


describe('Transactions routes', () => {

    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    }) // End to End devem ser como amigos -> Poucos e bons.

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

    it('should be able to get a specific transaction', async () => {
        const postResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            });

        const cookies = postResponse.get('Set-Cookie') as string[];

        const getResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)

        const transactionId = getResponse.body.transactions[0].id


        const response = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200);
        expect(response.body).toHaveProperty('transaction');
        expect(response.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            })
        );
        expect(typeof response.body.transaction).toBe('object');

    });

    it('should be able to get the summary', async () => {
        const postResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'Credit transaction',
                amount: 5000,
                type: 'credit',
            });

        const cookies = postResponse.get('Set-Cookie') as string[];

        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Debit transaction',
                amount: 2000,
                type: 'debit',
            });

        const response = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200);
        expect(response.body).toHaveProperty('summary');
        expect(response.body.summary).toEqual({amount: 3000}
        );
        expect(typeof response.body.summary).toBe('object');

    });

});