<script setup lang="ts">
import type { MessageDto } from '@/services/apiService'
import { nextTick, onMounted, ref, watch } from 'vue'
import MessageBubble from './MessageBubble.vue'

const props = defineProps<{
	messages: MessageDto[]
	currentUserEmail: string
	isGlobalChat: boolean
}>()

const messagesEndRef = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
	if (!messagesEndRef.value) return
	messagesEndRef.value.scrollIntoView({
		behavior: 'instant',
		block: 'end',
	})
}

onMounted(async () => {
	await nextTick()
	scrollToBottom()
})

watch(
	() => props.messages.length,
	async () => {
		await nextTick()
		scrollToBottom()
	},
)

function onImageLoaded() {
	scrollToBottom()
}
</script>

<template>
	<div class="flex-1 overflow-y-auto min-h-0 scroll-smooth" @image-loaded="onImageLoaded">
		<div class="flex flex-col gap-6 max-w-4xl mx-auto pb-2 pt-4 px-4">
			<MessageBubble
				v-for="msg in messages"
				:key="msg.id"
				:message="msg"
				:is-mine="msg.senderEmail === currentUserEmail"
				:is-global-chat="isGlobalChat"
			/>
			<div ref="messagesEndRef" class="h-px w-full"></div>
		</div>
	</div>
</template>
