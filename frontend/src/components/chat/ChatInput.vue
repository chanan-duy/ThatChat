<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useAutoResize } from '@/composables/useAutoResize'
import { FileIcon, Paperclip, SendHorizontal, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

defineProps<{
	isConnected: boolean
}>()

const emit = defineEmits<{
	(e: 'send', text: string, file: File | null): void
}>()

const messageText = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const { resize, reset } = useAutoResize(textareaRef)

function handleFileSelect(event: Event) {
	const target = event.target as HTMLInputElement
	if (target.files && target.files.length > 0) {
		const file = target.files[0]!
		if (file.size > 20 * 1024 * 1024) {
			toast.error('Файл слишком большой (максимум 20 МБ)')
			return
		}
		selectedFile.value = file
	}
}

function removeFile() {
	selectedFile.value = null
	if (fileInput.value) fileInput.value.value = ''
}

function handleSend() {
	if (!messageText.value.trim() && !selectedFile.value) return
	emit('send', messageText.value, selectedFile.value)

	messageText.value = ''
	selectedFile.value = null
	if (fileInput.value) fileInput.value.value = ''
	reset()
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault()
		handleSend()
	}
}
</script>

<template>
	<div class="shrink-0 p-4 bg-background border-t z-20">
		<div class="max-w-4xl mx-auto">
			<div
				v-if="selectedFile"
				class="flex items-center gap-3 mb-3 p-2 bg-muted/40 rounded-lg w-fit border shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-200"
			>
				<div class="w-8 h-8 rounded bg-background flex items-center justify-center border">
					<FileIcon class="w-4 h-4 text-blue-500" />
				</div>
				<div class="flex flex-col">
					<span class="text-xs font-medium max-w-[200px] truncate">{{ selectedFile.name }}</span>
					<span class="text-[10px] text-muted-foreground">
						{{ (selectedFile.size / 1024).toFixed(1) }} KB
					</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
					@click="removeFile"
				>
					<X class="w-3 h-3" />
				</Button>
			</div>

			<div class="flex gap-2 items-end">
				<input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" />

				<Button
					type="button"
					variant="outline"
					size="icon"
					class="shrink-0 h-[42px] w-[42px] rounded-xl"
					@click="fileInput?.click()"
					title="Прикрепить файл"
				>
					<Paperclip class="w-5 h-5 text-muted-foreground" />
				</Button>

				<div class="flex-1 relative">
					<textarea
						ref="textareaRef"
						v-model="messageText"
						rows="1"
						placeholder="Напишите сообщение..."
						class="flex w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[42px] max-h-[150px] resize-none overflow-y-auto leading-relaxed"
						:disabled="!isConnected"
						@input="resize"
						@keydown="handleKeydown"
					></textarea>
				</div>

				<Button
					type="submit"
					size="icon"
					class="shrink-0 h-[42px] w-[42px] rounded-xl transition-all active:scale-95"
					:disabled="(!messageText.trim() && !selectedFile) || !isConnected"
					@click="handleSend"
				>
					<SendHorizontal class="w-5 h-5 ml-0.5" />
				</Button>
			</div>
		</div>
	</div>
</template>
