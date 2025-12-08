import { Hono } from 'hono'
import { Nusawork } from './service/nusawork'

const app = new Hono()

app.get('/', async (c) => {
  const employees = await Nusawork.getTodayBirthdayEmployees();
  return c.json(employees);
})

export default app
