<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/services/authService'
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const router = useRouter()

async function handleLogin() {
	if (!email.value || !password.value) {
		toast.warning('Пожалуйста, заполните все поля')
		return
	}

	isLoading.value = true
	try {
		await auth.login({
			email: email.value,
			password: password.value,
		})

		toast.success('Добро пожаловать!')
		router.push('/')
	} catch (e) {
		console.error(e)
		toast.error('Ошибка входа. Проверьте Email или пароль.')
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
		<Card class="w-full max-w-md border-border shadow-lg">
			<CardHeader>
				<CardTitle class="text-center text-2xl font-bold">ThatChat</CardTitle>
				<CardDescription class="text-center">Вход</CardDescription>
			</CardHeader>

			<form @submit.prevent="handleLogin" class="flex flex-col gap-6">
				<CardContent class="grid gap-4">
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="example@example.com"
							v-model="email"
							:disabled="isLoading"
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="password">Пароль</Label>
						<Input
							id="password"
							type="password"
							v-model="password"
							:disabled="isLoading"
							required
						/>
					</div>
				</CardContent>

				<CardFooter class="flex flex-col gap-4">
					<Button class="w-full" type="submit" :disabled="isLoading">
						<Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
						{{ isLoading ? 'Входим...' : 'Войти' }}
					</Button>

					<div class="text-center text-sm text-muted-foreground">
						Нет аккаунта?
						<RouterLink
							to="/register"
							class="underline underline-offset-4 hover:text-primary transition-colors"
						>
							Регистрация
						</RouterLink>
					</div>
				</CardFooter>
			</form>
		</Card>
	</div>
</template>
