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

async function handleRegister() {
	if (!email.value || !password.value) {
		toast.warning('Заполните все поля')
		return
	}

	if (password.value.length < 4) {
		toast.warning('Пароль слишком короткий (минимум 4 символа)')
		return
	}

	isLoading.value = true
	try {
		await auth.register({
			email: email.value,
			password: password.value,
		})

		toast.success('Аккаунт создан! Входим...')

		await auth.login({
			email: email.value,
			password: password.value,
		})

		router.push('/')
	} catch (e: unknown) {
		console.error(e)
		toast.error('Ошибка регистрации. Возможно, email уже занят.')
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
		<Card class="w-full max-w-md border-border shadow-lg">
			<CardHeader>
				<CardTitle class="text-center text-2xl font-bold">Регистрация</CardTitle>
				<CardDescription class="text-center">Создание аккаунта</CardDescription>
			</CardHeader>

			<form @submit.prevent="handleRegister" class="flex flex-col gap-6">
				<CardContent class="grid gap-4">
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
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
						{{ isLoading ? 'Создаем...' : 'Зарегистрироваться' }}
					</Button>

					<div class="text-center text-sm text-muted-foreground">
						Уже есть аккаунт?
						<RouterLink
							to="/login"
							class="underline underline-offset-4 hover:text-primary transition-colors"
						>
							Войти
						</RouterLink>
					</div>
				</CardFooter>
			</form>
		</Card>
	</div>
</template>
