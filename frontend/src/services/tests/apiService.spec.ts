import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
	const toast = { error: vi.fn() }

	const axiosInstance = {
		get: vi.fn(),
		post: vi.fn(),
		interceptors: {
			response: { use: vi.fn() },
		},
	}

	return {
		toast,
		axiosInstance,
		axiosCreate: vi.fn(() => axiosInstance),
	}
})

vi.mock('vue-sonner', () => ({
	toast: mocks.toast,
}))

vi.mock('../authService', () => ({
	auth: {
		addAxiosInterceptor: vi.fn(),
		isLoggedIn: { value: true },
	},
}))

vi.mock('axios', async (importOriginal) => {
	const actual = await importOriginal<typeof import('axios')>()
	return {
		...actual,
		default: {
			...actual.default,
			create: mocks.axiosCreate,
		},
		isAxiosError: actual.isAxiosError,
	}
})

import { AxiosError } from 'axios'
import { ApiService } from '../apiService'
import { auth } from '../authService'

describe('ApiService', () => {
	let api: ApiService

	beforeEach(() => {
		vi.clearAllMocks()
		api = new ApiService(auth)
	})

	it('attaches auth interceptor on creation', () => {
		expect(auth.addAxiosInterceptor).toHaveBeenCalledWith(mocks.axiosInstance)
	})

	it('getChats calls axios.get', async () => {
		mocks.axiosInstance.get.mockResolvedValue({ data: [] })

		await api.getChats()

		expect(mocks.axiosInstance.get).toHaveBeenCalledWith('/chats')
	})

	it('uploadFile creates FormData correctly', async () => {
		mocks.axiosInstance.post.mockResolvedValue({ data: { url: 'test.jpg' } })

		const file = new File(['content'], 'test.txt', { type: 'text/plain' })
		await api.uploadFile(file)

		expect(mocks.axiosInstance.post).toHaveBeenCalledWith(
			'/upload',
			expect.any(FormData),
			expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }),
		)
	})

	it('handles network errors via interceptor', async () => {
		const errorCallback = vi.mocked(mocks.axiosInstance.interceptors.response.use).mock.calls[0]![1]

		const networkError = new AxiosError('Network Error')
		networkError.code = 'ERR_NETWORK'

		if (errorCallback) {
			await expect(errorCallback(networkError)).rejects.toThrow()

			expect(mocks.toast.error).toHaveBeenCalled()
		} else {
			throw new Error('Interceptor not registered')
		}
	})
})
