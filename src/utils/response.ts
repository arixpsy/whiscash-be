import type { Response as Res } from 'express'

type ErrorJSONResponse = {
  message: string
  description: string
  data?: Record<string, any> | Array<any>
}

const buildResponse = (response: Res, code: number, json: any) => {
  const isErrorCode = code >= 400
  response.status(code).json(isErrorCode ? { code, ...json } : json)
}

const buildErrorResponse =
  (code: number) => (res: Res, body: ErrorJSONResponse) =>
    buildResponse(res, code, body)
const buildSuccessResponse = (code: number) => (res: Res, body: any) =>
  buildResponse(res, code, body)

const response = {
  ok: buildSuccessResponse(200),
  created: buildSuccessResponse(201),
  badRequest: buildErrorResponse(400),
  unauthorized: buildErrorResponse(401),
  notFound: buildErrorResponse(404),
  tooManyRequest: buildErrorResponse(429),
  internalServerError: buildErrorResponse(500),
}

export default response
