import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MessageBubble from '../MessageBubble.vue'

describe('MessageBubble.vue', () => {
	const baseMessage = {
		id: '1',
		chatId: '1',
		senderId: 'user1',
		senderEmail: 'alice@test.com',
		text: 'Hello World',
		createdAt: '2023-01-01T12:00:00Z',
	}

	it('renders own message on the right with primary color', () => {
		const wrapper = mount(MessageBubble, {
			props: {
				message: baseMessage,
				isMine: true,
				isGlobalChat: false,
			},
		})

		expect(wrapper.classes()).toContain('self-end')
		expect(wrapper.find('.bg-primary').exists()).toBe(true)
		expect(wrapper.text()).toContain('Hello World')
	})

	it('renders other message on the left', () => {
		const wrapper = mount(MessageBubble, {
			props: {
				message: baseMessage,
				isMine: false,
				isGlobalChat: false,
			},
		})

		expect(wrapper.classes()).toContain('self-start')
		expect(wrapper.find('.bg-card').exists()).toBe(true)
	})

	it('shows sender email in global chat for others', () => {
		const wrapper = mount(MessageBubble, {
			props: {
				message: baseMessage,
				isMine: false,
				isGlobalChat: true,
			},
		})

		expect(wrapper.text()).toContain('alice@test.com')
	})

	it('renders image attachment', () => {
		const wrapper = mount(MessageBubble, {
			props: {
				message: { ...baseMessage, fileUrl: 'image.png', text: '' },
				isMine: true,
				isGlobalChat: false,
			},
		})

		expect(wrapper.find('img').exists()).toBe(true)
		expect(wrapper.find('img').attributes('src')).toContain('image.png')
	})

	it('renders file attachment link', () => {
		const wrapper = mount(MessageBubble, {
			props: {
				message: { ...baseMessage, fileUrl: 'doc.pdf', text: '' },
				isMine: true,
				isGlobalChat: false,
			},
		})

		expect(wrapper.find('a').exists()).toBe(true)
		expect(wrapper.find('a').attributes('href')).toContain('doc.pdf')
		expect(wrapper.text()).toContain('Файл вложения')
	})
})
