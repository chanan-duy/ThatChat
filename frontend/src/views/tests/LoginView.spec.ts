import { auth } from '@/services/authService'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import LoginView from '../LoginView.vue'

vi.mock('@/services/authService', () => ({
	auth: {
		login: vi.fn(),
	},
}))

vi.mock('vue-sonner', () => ({
	toast: {
		warning: vi.fn(),
		success: vi.fn(),
		error: vi.fn(),
	},
}))

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
	useRouter: () => ({ push: mockPush }),
	RouterLink: { template: '<a><slot/></a>' },
}))

describe('LoginView.vue', () => {
	it('shows warning if fields are empty', async () => {
		const wrapper = mount(LoginView, {
			global: { stubs: { RouterLink: true } },
		})
		await wrapper.find('form').trigger('submit')

		expect(auth.login).not.toHaveBeenCalled()
	})

	it('calls auth.login with correct data', async () => {
		const wrapper = mount(LoginView, {
			global: { stubs: { RouterLink: true } },
		})

		await wrapper.find('input[type="email"]').setValue('user@test.com')
		await wrapper.find('input[type="password"]').setValue('password')
		await wrapper.find('form').trigger('submit')

		expect(auth.login).toHaveBeenCalledWith({
			email: 'user@test.com',
			password: 'password',
		})
	})

	it('redirects to home on success', async () => {
		const wrapper = mount(LoginView, {
			global: { stubs: { RouterLink: true } },
		})
		vi.mocked(auth.login).mockResolvedValue({
			accessToken: '1',
			expiresIn: 1,
			refreshToken: '2',
		})

		await wrapper.find('input[type="email"]').setValue('user@test.com')
		await wrapper.find('input[type="password"]').setValue('password')
		await wrapper.find('form').trigger('submit')

		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(mockPush).toHaveBeenCalledWith('/')
	})
})
