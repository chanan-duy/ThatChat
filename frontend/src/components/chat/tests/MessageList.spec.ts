import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MessageList from '../MessageList.vue'

describe('MessageList.vue', () => {
	const scrollMock = vi.fn()

	beforeEach(() => {
		scrollMock.mockClear()
		window.HTMLElement.prototype.scrollIntoView = scrollMock
		window.Element.prototype.scrollIntoView = scrollMock
	})

	it('scrolls to bottom on mount', async () => {
		const wrapper = mount(MessageList, {
			attachTo: document.body,
			props: {
				messages: [{ id: '1', chatId: '1', senderId: '1', text: 'hi', createdAt: '' }],
				currentUserEmail: 'me@me.com',
				isGlobalChat: false,
			},
			global: {
				stubs: { MessageBubble: true },
			},
		})

		await wrapper.vm.$nextTick()
		await flushPromises()
		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(scrollMock).toHaveBeenCalled()

		wrapper.unmount()
	})

	it('scrolls to bottom when new message arrives', async () => {
		const wrapper = mount(MessageList, {
			attachTo: document.body,
			props: {
				messages: [],
				currentUserEmail: 'me@me.com',
				isGlobalChat: false,
			},
			global: {
				stubs: { MessageBubble: true },
			},
		})

		await wrapper.setProps({
			messages: [{ id: '1', chatId: '1', senderId: '1', text: 'new', createdAt: '' }],
		})

		await wrapper.vm.$nextTick()
		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(scrollMock).toHaveBeenCalled()

		wrapper.unmount()
	})
})
