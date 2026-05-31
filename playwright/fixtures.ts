import { APIRequestContext } from '@playwright/test'

export async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/v1/auth/refresh')
  const json = await res.json()
  return json.data.access_token as string
}

export { test, expect } from '@playwright/test'
