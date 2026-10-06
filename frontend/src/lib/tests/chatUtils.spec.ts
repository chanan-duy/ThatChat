import { describe, expect, it, vi } from 'vitest'
import { formatTime, getFileUrl, getInitials } from '../chatUtils'

describe('chatUtils', () => {
	describe('getInitials', () => {
		it('returns first two characters uppercase', () => {
			expect(getInitials('alexander')).toBe('AL')
			expect(getInitials('john')).toBe('JO')
		})

		it('handles single character names', () => {
			expect(getInitials('a')).toBe('A')
		})

		it('returns ?? for empty or undefined', () => {
			expect(getInitials('')).toBe('??')
			expect(getInitials(undefined)).toBe('??')
		})
	})

	describe('formatTime', () => {
		it('returns time in HH:MM format', () => {
			const date = new Date('2023-01-01T14:30:00')
			const spy = vi.spyOn(date, 'toLocaleTimeString').mockReturnValue('14:30')

			const result = formatTime(date.toISOString())

			expect(result).toBe('14:30')
			spy.mockRestore()
		})
	})

	describe('getFileUrl', () => {
		it('returns empty string if path is missing', () => {
			expect(getFileUrl('')).toBe('')
			expect(getFileUrl(undefined)).toBe('')
		})

		it('returns absolute url as is', () => {
			expect(getFileUrl('https://example.com/img.png')).toBe('https://example.com/img.png')
		})

		it('constructs url for relative path', () => {
			const path = '/uploads/test.jpg'
			const url = getFileUrl(path)
			expect(url).toContain('uploads/test.jpg')
		})
	})
})
