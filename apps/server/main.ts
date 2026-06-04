import {Elysia} from 'elysia'
import {wordBookRoute} from '@/modules/word-book'

const app = new Elysia()
	.get('/', () => ({hello: 'Bun👋', date: new Date()}))
	.group('/api', (app) =>
		app
			.use(wordBookRoute)
	)
	.listen(8080)

console.log(`Listening on ${app.server!.url}`);

