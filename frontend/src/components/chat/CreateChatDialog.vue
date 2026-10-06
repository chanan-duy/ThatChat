<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusIcon } from 'lucide-vue-next'
import { ref } from 'vue'

const emit = defineEmits<{
	(e: 'create', email: string): void
}>()

const isOpen = ref(false)
const email = ref('')

function handleSubmit() {
	if (!email.value) return
	emit('create', email.value)
	isOpen.value = false
	email.value = ''
}
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogTrigger as-child>
			<Button variant="ghost" size="icon" title="Создать чат" class="h-8 w-8">
				<PlusIcon class="w-5 h-5" />
			</Button>
		</DialogTrigger>
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Новый чат</DialogTitle>
				<DialogDescription> Введите Email пользователя для начала общения. </DialogDescription>
			</DialogHeader>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="email">Email собеседника</Label>
					<Input
						id="email"
						v-model="email"
						placeholder="friend@example.com"
						@keyup.enter="handleSubmit"
					/>
				</div>
			</div>
			<DialogFooter>
				<Button type="submit" @click="handleSubmit">Начать общение</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
