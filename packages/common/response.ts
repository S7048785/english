export type Result<T> = Promise<Data<T>>;

export type Data<T> = {
	timestamp: string;
	path: string;
	message: string;
	code: number;
	success: boolean;
	data: T;
};
