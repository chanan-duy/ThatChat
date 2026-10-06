import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChatHeader from '../ChatHeader.vue'

describe('ChatHeader.vue', () => {
	it('renders chat name correctly', () => {
		const wrapper = mount(ChatHeader, {
			props: {
				name: 'Test Chat',
			},
		})

		expect(wrapper.text()).toContain('Test Chat')
	})

	it('renders initials in avatar', () => {
		const wrapper = mount(ChatHeader, {
			props: {
				name: 'Test Chat',
			},
		})

		expect(wrapper.text()).toContain('TE')
	})
})
