import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ChatInput from '../ChatInput.vue'

vi.mock('vue-sonner', () => ({
	toast: {
		error: vi.fn(),
	},
}))

describe('ChatInput.vue', () => {
	it('renders correctly', () => {
		const wrapper = mount(ChatInput, {
			props: { isConnected: true },
		})
		expect(wrapper.find('textarea').exists()).toBe(true)
		expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
	})

	it('emits send event with text on button click', async () => {
		const wrapper = mount(ChatInput, {
			props: { isConnected: true },
		})

		await wrapper.find('textarea').setValue('Hello')
		await wrapper.find('button[type="submit"]').trigger('click')

		expect(wrapper.emitted('send')).toBeTruthy()
		expect(wrapper.emitted('send')![0]).toEqual(['Hello', null])
	})

	it('emits send event on Enter key', async () => {
		const wrapper = mount(ChatInput, {
			props: { isConnected: true },
		})

		await wrapper.find('textarea').setValue('General Kenobi')
		await wrapper.find('textarea').trigger('keydown', { key: 'Enter' })

		expect(wrapper.emitted('send')).toBeTruthy()
		expect(wrapper.emitted('send')![0]).toEqual(['General Kenobi', null])
	})

	it('does not emit if empty', async () => {
		const wrapper = mount(ChatInput, {
			props: { isConnected: true },
		})

		await wrapper.find('button[type="submit"]').trigger('click')
		expect(wrapper.emitted('send')).toBeFalsy()
	})

	it('does not emit if disabled (disconnected)', async () => {
		const wrapper = mount(ChatInput, {
			props: { isConnected: false },
		})

		await wrapper.find('textarea').setValue('Test')
		await wrapper.find('button[type="submit"]').trigger('click')

		expect(wrapper.emitted('send')).toBeFalsy()
	})

	it('clears input after sending', async () => {
		const wrapper = mount(ChatInput, {
			props: { isConnected: true },
		})

		const textarea = wrapper.find('textarea')
		await textarea.setValue('Message')
		await wrapper.find('button[type="submit"]').trigger('click')

		expect(textarea.element.value).toBe('')
	})
})
