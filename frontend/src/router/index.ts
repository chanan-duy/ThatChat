import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/services/authService'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ChatView from '@/views/ChatView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
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
	],
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

export default router
