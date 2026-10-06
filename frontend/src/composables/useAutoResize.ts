import { type Ref } from 'vue'

export function useAutoResize(textareaRef: Ref<HTMLTextAreaElement | null>) {
	function resize() {
		const el = textareaRef.value
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${Math.min(el.scrollHeight, 150)}px`
	}

	function reset() {
		if (textareaRef.value) {
			textareaRef.value.style.height = 'auto'
		}
	}

	return { resize, reset }
}
