import {Elysia} from 'elysia'
import {jwt} from '@elysia/jwt'

export const authPlugin = (app: Elysia) => app
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.SECRET_KEY!,
			exp: '7d',
		})
	)
	.derive(async ({jwt, headers, set}) => {
		const authorization = headers.authorization

		if (!authorization) {
			set.status = 401
			throw new Error('未提供授权令牌')
		}

		const token = authorization.replace('Bearer ', '')
		const decoded = await jwt.verify(token)

		if (!decoded || decoded.tokenType === 'refresh') {
			set.status = 401
			throw new Error('无效的访问令牌或令牌已过期')
		}

		return {
			user: {
				userId: decoded.userId as string,
				name: decoded.name as string,
				email: decoded.email as string,
			}
		}
	})
