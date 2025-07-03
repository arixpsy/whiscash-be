import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { Response, Request } from 'express'
import { unlink, readFileSync } from 'fs'
import settingsDAO from '@/dao/settingsDAO'
import response from '@/utils/response'

const model = new ChatOpenAI({
  model: 'gpt-4.1-mini',
  apiKey: process.env.OPENAI_API_KEY,
})

export const handleReadImage = async (req: Request, res: Response) => {
  const { userId } = req.auth

  if (!userId) {
    response.unauthorized(res)
    return
  }

  const isImageEndpointEnabled = settingsDAO.getUserImageEndpointEnabled(userId)

  if (!isImageEndpointEnabled) {
    response.forbidden(res, {
      message: 'Forbidden',
      description:
        'You do not have permission to use this feature. Please contact Arix',
    })
  }

  if (!req.file) {
    response.badRequest(res, {
      message: 'Bad request',
      description: 'Image not found',
    })
    return
  }

  const fileBuffer = readFileSync(req.file.path)
  const base64 = fileBuffer.toString('base64')

  if (!base64) {
    response.badRequest(res, {
      message: 'Bad request',
      description: 'Invalid image',
    })
    return
  }

  res.json({
    amount: 20,
    category: 'FOOD',
    description: 'testing',
  })

  unlink(req.file.path, () => {
    console.log(`File at [${req.file?.path}] was deleted successfully `)
  })

  return

  // TODO:

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expense tracker. Determine if the following image contains information about an expense. Find out the total amount spent, the timestamp of the expense in UTC, and generate a short description of the expense based on the store and items purchased in the image. Also determine a suitable category of the expense based on this list: [Accommodation, Entertainment, Fitness, Food, Games, Gifts, Grooming, Hobbies, Insurance, Medical, Others, Pet, Shopping, Transfers, Transport, Travel, Utilities, Work].

      Reply in the following JSON format:
      {{
        "amount": 0,
        "category": "",
        "description": "",
        "paidAt": ""
      }}
      `,
    ],
    ['user', [{ type: 'image_url', image_url: '{base64}' }]],
  ])

  const chain = prompt.pipe(model)
  const invokeResponse = await chain.invoke({ base64 })

  console.log(invokeResponse)

  res.json(invokeResponse.content)
}
