import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useAutoResize } from '../useAutoResize'

describe('useAutoResize', () => {
	it('resizes element based on scrollHeight', () => {
		const mockEl = {
			style: { height: '' },
			scrollHeight: 100,
		} as unknown as HTMLTextAreaElement

		const elementRef = ref(mockEl)
		const { resize } = useAutoResize(elementRef)

		resize()

		expect(mockEl.style.height).toBe('100px')
	})

	it('caps height at 150px', () => {
		const mockEl = {
			style: { height: '' },
			scrollHeight: 500,
		} as unknown as HTMLTextAreaElement

		const elementRef = ref(mockEl)
		const { resize } = useAutoResize(elementRef)

		resize()

		expect(mockEl.style.height).toBe('150px')
	})

	it('resets height to auto', () => {
		const mockEl = {
			style: { height: '100px' },
			scrollHeight: 100,
		} as unknown as HTMLTextAreaElement

		const elementRef = ref(mockEl)
		const { reset } = useAutoResize(elementRef)

		reset()

		expect(mockEl.style.height).toBe('auto')
	})

	it('does nothing if ref is null', () => {
		const elementRef = ref(null)
		const { resize, reset } = useAutoResize(elementRef)

		expect(() => resize()).not.toThrow()
		expect(() => reset()).not.toThrow()
	})
})
