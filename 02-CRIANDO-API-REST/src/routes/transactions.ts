import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
    //tudo que eu registrar nesse contexto, mesmo que global, vai valer pra todas as rotas dentro desse contexto
    //, dentro desse plugin.
    // ou seja, se eu criar outro arquivo de rotas, tudo que tiver dentro desse plugin globalmente, não vai afetar os outros routes..
    //  por isso agora vamos fazer um app addHook

    app.addHook('preHandler', async (request, reply) => {
        //este é o melhor local pra fazer a validação global.. poderia ser uma função e ser chamada aqui
    })

    // se eu criar outra rota e o handler ser global, as outras rotas não recebem.. ele deveria ser chamado daí direto no server..

    app.get(
        '/',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request) => {
            const { sessionId } = request.cookies

            const transactions = await knex('transactions')
                .where('session_id', sessionId)
                .select()

            return { transactions }
        },
    )


    app.get(
        '/:id',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request) => {
            const getTransactionsParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getTransactionsParamsSchema.parse(request.params)

            const { sessionId } = request.cookies




            const transaction = await knex('transactions')
                .where({
                    session_id: sessionId,
                    id,
                })
                .first()

            return {
                transaction,
            }
        },
    )

    app.get(
        '/summary',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request) => {
            const { sessionId } = request.cookies

            const summary = await knex('transactions')
                .where('session_id', sessionId)
                .sum('amount', { as: 'amount' })
                .first()

            return { summary }
        },
    )

    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(
            request.body,
        )


        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, //7 days
            })
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send()
    })
}