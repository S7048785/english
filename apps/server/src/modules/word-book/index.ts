import {Elysia} from "elysia"
import {Repository} from "./repository"
import {Service} from "./service"
import {WordBookResponseDto, WordQueryDto} from "./dto";
import {authPlugin} from "@/plugins/auth";

const setupWordBook = () => {
	const repository = new Repository()
	const service = new Service(repository)
	return new Elysia().state(() => ({service, repository}))
}

export const wordBookRoute = new Elysia({name: 'WordBookRoute'})
	.use(setupWordBook)
	.group("/word-book", {detail: {tags: ["word-book"]}}, (app) =>
		app
			.get("/", async ({store, query}) => {
				console.log('当前用户:')
				return store.service.pageWordBooks(query)
			}, {
				detail: {summary: "分页查询单词列表"},
				query: WordQueryDto,
				response: WordBookResponseDto,
			})
			.use(authPlugin)
			.get("/def", async ({store, query}) => {
				return "123"
			}))

