import type { ChatDto, MessageDto } from '@/services/apiService'
import type { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockHubConnection, mockHubConnectionBuilder } = vi.hoisted(() => {
	const connection = {
		start: vi.fn().mockResolvedValue(undefined),
		stop: vi.fn().mockResolvedValue(undefined),
		on: vi.fn(),
		invoke: vi.fn().mockResolvedValue(undefined),
		off: vi.fn(),
		state: 'Connected' as const,
		baseUrl: '',
		connectionId: '',
		keepAliveIntervalInMilliseconds: 0,
		serverTimeoutInMilliseconds: 0,
		onclose: vi.fn(),
		onreconnecting: vi.fn(),
		onreconnected: vi.fn(),
		stream: vi.fn(),
		send: vi.fn(),
	} as unknown as HubConnection

	const builder = {
		withUrl: vi.fn().mockReturnThis(),
		withAutomaticReconnect: vi.fn().mockReturnThis(),
		configureLogging: vi.fn().mockReturnThis(),
		build: vi.fn(() => connection),
	} as unknown as HubConnectionBuilder

	return { mockHubConnection: connection, mockHubConnectionBuilder: builder }
})

vi.mock('@microsoft/signalr', () => ({
	HubConnectionBuilder: vi.fn(function () {
		return mockHubConnectionBuilder
	}),
	LogLevel: { Information: 1 },
}))

vi.mock('@/services/apiService', () => ({
	api: {
		getChats: vi.fn(),
		getChatMessages: vi.fn(),
		uploadFile: vi.fn(),
		createChat: vi.fn(),
	},
}))

vi.mock('@/services/authService', () => ({
	auth: {
		isLoggedIn: { value: true },
		getVerifiedAccessToken: vi.fn().mockResolvedValue('fake_token'),
	},
}))

import { api } from '@/services/apiService'
import { useChatStore } from '../chatStore'

describe('Chat Store', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
		vi.clearAllMocks()
		Object.assign(mockHubConnection, { state: 'Connected' })
	})

	it('init loads chats and connects signalr', async () => {
		const store = useChatStore()
		const mockChats: ChatDto[] = [{ id: '1', name: 'General', isGlobal: true }]

		vi.mocked(api.getChats).mockResolvedValue(mockChats)

		await store.init()

		expect(api.getChats).toHaveBeenCalled()
		expect(store.chats).toHaveLength(1)
		expect(mockHubConnection.start).toHaveBeenCalled()
		expect(store.isConnected).toBe(true)
	})

	it('adds message on signalr event', async () => {
		const store = useChatStore()
		await store.init()

		const onCall = vi
			.mocked(mockHubConnection.on)
			.mock.calls.find((call) => call[0] === 'ReceiveChatMessage')
		const callback = onCall?.[1]

		if (!callback) throw new Error('SignalR event listener not registered')

		store.activeChatId = 'chat_1'

		const incomingMsg: MessageDto = {
			id: 'm1',
			chatId: 'chat_1',
			senderId: 'u1',
			senderEmail: 'test@test.com',
			text: 'Hello',
			createdAt: '2023-01-01',
		}

		callback(incomingMsg)

		expect(store.messages).toContainEqual(incomingMsg)
	})

	it('sendMessage uploads file and invokes signalr', async () => {
		const store = useChatStore()
		store.activeChatId = 'chat_1'
		await store.init()

		const mockFile = new File([''], 'test.png')
		vi.mocked(api.uploadFile).mockResolvedValue('http://cdn.com/test.png')

		await store.sendMessage('Hello', mockFile)

		expect(api.uploadFile).toHaveBeenCalledWith(mockFile)
		expect(mockHubConnection.invoke).toHaveBeenCalledWith(
			'SendMessage',
			'chat_1',
			'Hello',
			'http://cdn.com/test.png',
		)
	})
})
