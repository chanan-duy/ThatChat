import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAxiosInstance, mockCreate } = vi.hoisted(() => {
	const post = vi.fn()
	const interceptors = {
		request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
		response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
	}

	const instance = {
		post,
		interceptors,
		defaults: { baseURL: '' },
	} as unknown as AxiosInstance

	return {
		mockAxiosInstance: instance,
		mockCreate: vi.fn(() => instance),
	}
})

vi.mock('axios', async (importOriginal) => {
	const actual = await importOriginal<typeof import('axios')>()
	return {
		...actual,
		default: {
			...actual.default,
			create: mockCreate,
		},
		isAxiosError: actual.isAxiosError,
	}
})

import { auth } from '../authService'

describe('AuthService', () => {
	beforeEach(() => {
		auth.logout()
		localStorage.clear()
		vi.mocked(mockAxiosInstance.post).mockReset()
	})

	it('login stores tokens and updates state', async () => {
		const responseData = {
			accessToken: 'access123',
			refreshToken: 'refresh123',
			expiresIn: 3600,
		}

		const mockResponse = {
			data: responseData,
			status: 200,
			statusText: 'OK',
			headers: {},
			config: {} as InternalAxiosRequestConfig,
		} as AxiosResponse

		vi.mocked(mockAxiosInstance.post).mockResolvedValue(mockResponse)

		await auth.login({ email: 'test@test.com', password: '123' })

		expect(auth.isLoggedIn.value).toBe(true)
		expect(localStorage.getItem('__accessToken')).toBe('access123')
		expect(localStorage.getItem('__userEmail')).toBe('test@test.com')
	})

	it('logout clears tokens and state', () => {
		localStorage.setItem('__accessToken', 'token')
		auth.isLoggedIn.value = true

		auth.logout()

		expect(auth.isLoggedIn.value).toBe(false)
		expect(localStorage.getItem('__accessToken')).toBeNull()
	})
})
