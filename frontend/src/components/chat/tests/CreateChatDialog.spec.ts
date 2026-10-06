import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CreateChatDialog from '../CreateChatDialog.vue'

describe('CreateChatDialog.vue', () => {
	it('renders trigger button', () => {
		const wrapper = mount(CreateChatDialog, {
			global: {
				stubs: {
					Dialog: { template: '<div><slot /></div>' },
					DialogTrigger: { template: '<div><slot /></div>' },
					DialogContent: { template: '<div><slot /></div>' },
					DialogHeader: { template: '<div><slot /></div>' },
					DialogTitle: { template: '<div><slot /></div>' },
					DialogDescription: { template: '<div><slot /></div>' },
					DialogFooter: { template: '<div><slot /></div>' },
				},
			},
		})

		expect(wrapper.find('button[title="Создать чат"]').exists()).toBe(true)
	})

	it('emits create event when submitting form', async () => {
		const wrapper = mount(CreateChatDialog, {
			global: {
				stubs: {
					Dialog: { template: '<div><slot /></div>' },
					DialogTrigger: { template: '<div><slot /></div>' },
					DialogContent: { template: '<div><slot /></div>' },
					DialogHeader: { template: '<div></div>' },
					DialogFooter: { template: '<div><slot /></div>' },
				},
			},
		})

		const input = wrapper.find('input')
		const submitBtn = wrapper.find('button[type="submit"]')

		await input.setValue('test@test.com')
		await submitBtn.trigger('click')

		expect(wrapper.emitted('create')).toBeTruthy()
		expect(wrapper.emitted('create')![0]).toEqual(['test@test.com'])
	})
})
