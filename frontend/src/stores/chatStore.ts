import { api, type ChatDto, type MessageDto as ChatMessageDto } from '@/services/apiService'
import { auth } from '@/services/authService'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
	const chats = ref<ChatDto[]>([])
	const activeChatId = ref<string | null>(null)
	const messages = ref<ChatMessageDto[]>([])
	const isConnected = ref(false)

	let hubConnection: HubConnection | null = null

	const activeChat = computed(() => chats.value.find((c) => c.id === activeChatId.value))

	async function init() {
		if (!auth.isLoggedIn.value) return

		try {
			chats.value = await api.getChats()

			await startSignalR()
		} catch (e) {
			console.error('Init failed:', e)
		}
	}

	async function startSignalR() {
		if (hubConnection) return

		const url = import.meta.env.VITE_API_URL || 'http://localhost:5042'

		hubConnection = new HubConnectionBuilder()
			.withUrl(`${url}/hubs/chat`, {
				accessTokenFactory: async () => {
					const token = await auth.getVerifiedAccessToken()
					return token || ''
				},
			})
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Information)
			.build()

		hubConnection.on('ReceiveChatMessage', (msg: ChatMessageDto) => {
			if (msg.chatId === activeChatId.value) {
				messages.value.push(msg)
			}
		})

		hubConnection.on('ReceiveNewChat', (msg: ChatDto) => {
			if (chats.value.find((c) => c.id === msg.id)) {
				return
			}

			console.log('asdfsadfasdf')

			chats.value.push(msg)
		})

		try {
			await hubConnection.start()
			isConnected.value = true
			console.log('SignalR Connected')
		} catch (err) {
			console.error('SignalR Connection Error:', err)
		}
	}

	async function selectChat(chatId: string) {
		if (activeChatId.value === chatId) return

		if (activeChatId.value && hubConnection) {
			await hubConnection.invoke('LeaveChat', activeChatId.value)
		}

		activeChatId.value = chatId
		messages.value = []

		try {
			const history = await api.getChatMessages(chatId)
			messages.value = history

			if (hubConnection?.state === 'Connected') {
				await hubConnection.invoke('JoinChat', chatId)
			}
		} catch (e) {
			console.error('Failed to load chat:', e)
		}
	}

	async function sendMessage(text: string, file: File | null) {
		if (!activeChatId.value || (!text && !file)) return

		try {
			let fileUrl = null

			if (file) {
				fileUrl = await api.uploadFile(file)
			}

			if (hubConnection) {
				await hubConnection.invoke('SendMessage', activeChatId.value, text, fileUrl)
			}
		} catch (e) {
			console.error('Send failed:', e)
			throw e
		}
	}

	async function createPrivateChat(email: string) {
		try {
			const newChat = await api.createChat(email)

			const exists = chats.value.find((c) => c.id === newChat.id)
			if (!exists) {
				chats.value.push(newChat)
			}

			await selectChat(newChat.id)
			return true
		} catch (e) {
			console.error(e)
			throw e
		}
	}

	return {
		chats,
		activeChatId,
		activeChat,
		messages,
		isConnected,
		init,
		selectChat,
		sendMessage,
		createPrivateChat,
	}
})
