import { Repository } from "./repository"
import {type WordQueryDto} from "@/modules/word-book/dto/query";

export class Service {
	constructor(private readonly wordBookRepository: Repository) {}

	async pageWordBooks(param: WordQueryDto) {
		return this.wordBookRepository.findWithPagination(param)
	}
}
