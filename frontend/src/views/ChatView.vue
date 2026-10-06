<script setup lang="ts">
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import MessageList from '@/components/chat/MessageList.vue'
import { auth } from '@/services/authService'
import { useChatStore } from '@/stores/chatStore'
import { isAxiosError } from 'axios'
import { AudioWaveformIcon } from 'lucide-vue-next'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const store = useChatStore()
const myEmail = localStorage.getItem('__userEmail') || ''

onMounted(async () => {
	if (!auth.isLoggedIn.value) {
		router.push('/login')
		return
	}
	await store.init()
})

function handleLogout() {
	auth.logout()
	router.push('/login')
}

async function handleSendMessage(text: string, file: File | null) {
	try {
		await store.sendMessage(text, file)
	} catch (e) {
		console.error(e)
		toast.error('Не удалось отправить сообщение', {
			description: `${e}\n${(isAxiosError(e) && e.response?.data) || ''}`,
		})
	}
}

async function handleCreateChat(email: string) {
	try {
		await store.createPrivateChat(email)
		toast.success('Чат создан')
	} catch (e) {
		console.error(e)
		toast.error('Ошибка. Пользователь не найден?')
	}
}
</script>

<template>
	<div class="flex h-screen w-full bg-background overflow-hidden">
		<ChatSidebar
			:chats="store.chats"
			:active-chat-id="store.activeChatId"
			@select="store.selectChat"
			@create="handleCreateChat"
			@logout="handleLogout"
		/>

		<main class="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-background">
			<template v-if="store.activeChat">
				<ChatHeader :name="store.activeChat.name" />

				<MessageList
					:messages="store.messages"
					:current-user-email="myEmail"
					:is-global-chat="store.activeChat.isGlobal"
				/>

				<ChatInput :is-connected="store.isConnected" @send="handleSendMessage" />
			</template>

			<div
				v-else
				class="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4 p-8 text-center"
			>
				<div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
					<AudioWaveformIcon :size="34" />
				</div>
				<div class="flex flex-col gap-2">
					<h3 class="font-semibold text-lg text-foreground">Добро пожаловать</h3>
					<p class="text-sm">Выберите чат из списка или создайте новый для начала общения</p>
				</div>
			</div>
		</main>
	</div>
</template>
