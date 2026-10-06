import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChatSidebar from '../ChatSidebar.vue'

describe('ChatSidebar.vue', () => {
	const mockChats = [
		{ id: '1', name: 'Chat One', isGlobal: true },
		{ id: '2', name: 'Chat Two', isGlobal: false },
	]

	it('renders list of chats', () => {
		const wrapper = mount(ChatSidebar, {
			props: {
				chats: mockChats,
				activeChatId: null,
			},
			global: {
				stubs: {
					CreateChatDialog: true,
					ScrollArea: { template: '<div><slot /></div>' },
				},
			},
		})

		expect(wrapper.text()).toContain('Chat One')
		expect(wrapper.text()).toContain('Chat Two')
	})

	it('highlights active chat', () => {
		const wrapper = mount(ChatSidebar, {
			props: {
				chats: mockChats,
				activeChatId: '1',
			},
			global: {
				stubs: {
					CreateChatDialog: true,
					ScrollArea: { template: '<div><slot /></div>' },
				},
			},
		})

		const activeBtn = wrapper.findAll('button').find((b) => b.classes().includes('bg-secondary'))
		expect(activeBtn).toBeDefined()
		expect(activeBtn?.text()).toContain('Chat One')
	})

	it('emits select event when chat is clicked', async () => {
		const wrapper = mount(ChatSidebar, {
			props: {
				chats: mockChats,
				activeChatId: null,
			},
			global: {
				stubs: {
					CreateChatDialog: true,
					ScrollArea: { template: '<div><slot /></div>' },
				},
			},
		})

		const buttons = wrapper.findAll('button').filter((b) => b.text().includes('Chat Two'))
		await buttons[0]!.trigger('click')

		expect(wrapper.emitted('select')).toBeTruthy()
		expect(wrapper.emitted('select')![0]).toEqual(['2'])
	})

	it('emits logout event', async () => {
		const wrapper = mount(ChatSidebar, {
			props: { chats: [], activeChatId: null },
			global: {
				stubs: {
					CreateChatDialog: true,
					ScrollArea: { template: '<div><slot /></div>' },
				},
			},
		})

		const logoutBtn = wrapper.find('button[title="Выйти"]')
		await logoutBtn.trigger('click')

		expect(wrapper.emitted('logout')).toBeTruthy()
	})
})
