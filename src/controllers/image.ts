import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import type { Response, Request } from 'express'
import { unlink, readFileSync } from 'fs'
import settingsDAO from '@/dao/settingsDAO'
import response from '@/utils/response'
import { Category } from '@/utils/enum'

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

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `
      You are an expense tracker assistant. 
      You will receive an image, likely related to an expense (such as a receipt, invoice, payment confirmation, or a item/product purchased). 
      
      Your task:
      1. Analyze the image to determine whether it contains expense information.
      2. If it does, extract the following details:
        - amount: Total amount spent (number with two decimal places).
        - paidAt: Timestamp of the expense, converted to UTC in ISO 8601 format (e.g., "2025-07-04T12:00:00Z").
        - description: A short, concise description (under 40 characters), such as store name, purchased item(s), or activity.
        - category: The most suitable category from the following list:
          ${Object.values(Category).join(', ')}

      
      Output:
      Return the result strictly in this JSON format:
      {{
        "amount": 0,
        "category": "",
        "description": "",
        "paidAt": ""
      }}

      Important:
      - If an item cannot be reliably extracted, omit its key from the JSON output:
      - Remove "amount" if no valid amount is found.
      - Remove "paidAt" if no valid timestamp is found.
      - Remove "category" if none of the provided categories apply.
      - Remove "description" if you cannot determine a suitable description.

      Additional rules:
      - Only output valid JSON—no extra text, explanations, or comments.
      - Be accurate and concise in your extraction.
      `,
    ],
    [
      'user',
      [
        {
          type: 'image',
          source_type: 'base64',
          data: base64,
          mime_type: 'image/jpeg',
        },
      ],
    ],
  ])

  const chain = prompt.pipe(model)
  const invokeResponse = await chain.invoke({ base64 })

  let parsedResponse = {}

  try {
    parsedResponse = JSON.parse(invokeResponse.content as string)
  } catch (err) {
    console.log('Error parsing response from model', err)
    console.log(invokeResponse)
  }

  res.json(parsedResponse)

  unlink(req.file.path, () => {
    console.log(`File at [${req.file?.path}] was deleted successfully `)
  })
}
