import {PrismaClient} from '@prisma/client'

const prismaClient = new PrismaClient({
    log: ["query", "error"]
})

export default prismaClient;