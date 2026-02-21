import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render('404 Halaman Tidak Ditemukan')
}

export default handler
