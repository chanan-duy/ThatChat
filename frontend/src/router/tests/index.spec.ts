import { auth } from '@/services/authService'
import ChatView from '@/views/ChatView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'

vi.mock('@/services/authService', () => ({
	auth: {
		isLoggedIn: { value: false },
		addAxiosInterceptor: vi.fn(),
	},
}))

const routes = [
	{
		path: '/',
		name: 'chat',
		component: ChatView,
		meta: { requiresAuth: true },
	},
	{
		path: '/login',
		name: 'login',
		component: LoginView,
		meta: { guest: true },
	},
	{
		path: '/register',
		name: 'register',
		component: RegisterView,
		meta: { guest: true },
	},
]

describe('Router Guards', () => {
	let router: ReturnType<typeof createRouter>

	beforeEach(() => {
		router = createRouter({
			history: createWebHistory(),
			routes,
		})

		router.beforeEach(async (to, from, next) => {
			const isAuthenticated = auth.isLoggedIn.value

			if (to.meta.requiresAuth && !isAuthenticated) {
				next('/login')
			} else if (to.meta.guest && isAuthenticated) {
				next('/')
			} else {
				next()
			}
		})
	})

	it('redirects unauthenticated user to login when accessing protected route', async () => {
		auth.isLoggedIn.value = false
		await router.push('/')
		expect(router.currentRoute.value.path).toBe('/login')
	})

	it('allows authenticated user to access protected route', async () => {
		auth.isLoggedIn.value = true
		await router.push('/')
		expect(router.currentRoute.value.path).toBe('/')
	})

	it('redirects authenticated user to home when accessing login', async () => {
		auth.isLoggedIn.value = true
		await router.push('/login')
		expect(router.currentRoute.value.path).toBe('/')
	})

	it('allows unauthenticated user to access login', async () => {
		auth.isLoggedIn.value = false
		await router.push('/login')
		expect(router.currentRoute.value.path).toBe('/login')
	})
})
