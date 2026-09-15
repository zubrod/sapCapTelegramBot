import cds from '@sap/cds'
import { beforeEach } from 'vitest'



const { POST, expect, defaults } = cds.test()

describe('Test telegram bot operations', () => {

    beforeEach(async () => {
        await POST("/telegram/subscribeTelegramUser", { chatId: 123 })
    })

    it('should add a user', async () => {
        //arrange

        //act
        const user = await SELECT.one.from("TelegramUsers").where({ chatId: 123 });

        //assert
        expect(user.chatId).to.equal(123)
    })

    it('should update the email from a user if user is subscribed', async () => {
        //arrange

        //act
        await POST("/telegram/subscribeEmail", { chatId: 123 })
        const result = await POST("/telegram/updateEmail", { chatId: 123, email: "abc@abc.de" })

        //assert
        const user = await SELECT.from("TelegramUsers").where({ chatId: 123 });

        expect(result.status).to.equal(204);
        expect(user[0].email).to.equal("abc@abc.de")
        expect(user[0].emailSubscribed).to.equal(true)
    })

    it('should not update the email from a user if user is not subscribed', async () => {
        //arrange

        //act
        await POST("/telegram/unsubscribeEmail", { chatId: 123 })
        const result = await POST("/telegram/updateEmail", { chatId: 123, email: "abc@abc.de" })

        //assert
        const user = await SELECT.from("TelegramUsers").where({ chatId: 123 });

        expect(result.status).to.equal(204);
        expect(user.length).to.equal(1)
        expect(user[0].email).to.equal(null)
        expect(user[0].emailSubscribed).to.equal(false)
    })

})