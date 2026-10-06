import { useChatStore } from '@/stores/chatStore'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentPublicInstance } from 'vue'
import ChatView from '../ChatView.vue'

vi.mock('@/services/authService', () => ({
	auth: {
		isLoggedIn: { value: true },
		logout: vi.fn(),
		addAxiosInterceptor: vi.fn(),
		getVerifiedAccessToken: vi.fn().mockResolvedValue('token'),
	},
}))

vi.mock('vue-router', () => ({
	useRouter: () => ({ push: vi.fn() }),
}))

describe('ChatView.vue', () => {
	let wrapper: VueWrapper<ComponentPublicInstance>
	let store: ReturnType<typeof useChatStore>

	beforeEach(() => {
		wrapper = mount(ChatView, {
			global: {
				plugins: [
					createTestingPinia({
						createSpy: vi.fn,
						initialState: {
							chat: {
								chats: [{ id: '1', name: 'Global', isGlobal: true }],
								activeChatId: null,
								messages: [],
								isConnected: true,
							},
						},
					}),
				],
				stubs: {
					ChatSidebar: {
						template:
							"<div class=\"sidebar-stub\"><button @click=\"$emit('select', '1')\">Select</button><button @click=\"$emit('create', 'email')\">Create</button></div>",
						props: ['chats', 'activeChatId'],
					},
					ChatInput: {
						template:
							'<div class="input-stub"><button @click="$emit(\'send\', \'hello\', null)">Send</button></div>',
						props: ['isConnected'],
					},
					MessageList: { template: '<div class="list-stub"></div>' },
					ChatHeader: { template: '<div class="header-stub"></div>' },
				},
			},
		})
		store = useChatStore()
	})

	it('renders sidebar', () => {
		expect(wrapper.find('.sidebar-stub').exists()).toBe(true)
	})

	it('calls store.selectChat when sidebar emits select', async () => {
		await wrapper.find('.sidebar-stub button').trigger('click')
		expect(store.selectChat).toHaveBeenCalledWith('1')
	})

	it('renders main chat area only when activeChat is set', async () => {
		expect(wrapper.find('.input-stub').exists()).toBe(false)

		store.activeChatId = '1'
		await wrapper.vm.$nextTick()

		expect(wrapper.find('.input-stub').exists()).toBe(true)
		expect(wrapper.find('.header-stub').exists()).toBe(true)
	})

	it('calls store.sendMessage when input emits send', async () => {
		store.activeChatId = '1'
		await wrapper.vm.$nextTick()

		const sendBtn = wrapper.find('.input-stub button')
		await sendBtn.trigger('click')

		expect(store.sendMessage).toHaveBeenCalledWith('hello', null)
	})

	it('calls store.createPrivateChat when sidebar emits create', async () => {
		const buttons = wrapper.findAll('.sidebar-stub button')
		if (buttons.length > 1) {
			await buttons[1]!.trigger('click')
			expect(store.createPrivateChat).toHaveBeenCalledWith('email')
		} else {
			throw new Error('Create button not found in stub')
		}
	})
})
