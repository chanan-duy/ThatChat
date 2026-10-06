<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatTime, getFileUrl, getInitials } from '@/lib/chatUtils'
import type { MessageDto } from '@/services/apiService'
import { Download, FileIcon } from 'lucide-vue-next'

defineProps<{
	message: MessageDto
	isMine: boolean
	isGlobalChat: boolean
}>()

function openFile(url: string) {
	window.open(url, '_blank')
}

function handleImageLoad(e: Event) {
	const target = e.target as HTMLImageElement
	target.dispatchEvent(new CustomEvent('image-loaded', { bubbles: true }))
}
</script>

<template>
	<div :class="['flex gap-3 max-w-[85%]', isMine ? 'self-end flex-row-reverse' : 'self-start']">
		<Avatar v-if="!isMine" class="w-8 h-8 mt-auto shrink-0 border">
			<AvatarFallback class="text-[10px] bg-muted">
				{{ getInitials(message.senderEmail) }}
			</AvatarFallback>
		</Avatar>

		<div
			:class="[
				'flex flex-col shadow-sm border relative overflow-hidden min-w-[60px]',
				isMine
					? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none border-primary/20'
					: 'bg-card text-card-foreground rounded-2xl rounded-bl-none border-border',
			]"
		>
			<div v-if="!isMine && isGlobalChat" class="px-3 pt-2 text-[10px] text-primary/70 font-bold">
				{{ message.senderEmail || 'Unknown' }}
			</div>

			<div class="p-3">
				<div v-if="message.fileUrl" class="mb-2">
					<div v-if="message.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)" class="relative group">
						<img
							:src="getFileUrl(message.fileUrl)"
							class="rounded-lg object-contain bg-black/5 dark:bg-white/5 cursor-zoom-in block"
							style="max-height: 350px; width: auto; max-width: 100%"
							alt="Attachment"
							loading="lazy"
							@click="openFile(getFileUrl(message.fileUrl))"
							@load="handleImageLoad"
						/>
					</div>

					<a
						v-else
						:href="getFileUrl(message.fileUrl)"
						target="_blank"
						class="flex items-center gap-3 p-3 rounded-lg transition-colors border group"
						:class="
							isMine
								? 'bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20'
								: 'bg-background/50 hover:bg-background/80 border-border/50'
						"
					>
						<div
							class="p-2 rounded-full transition-colors"
							:class="
								isMine
									? 'bg-primary-foreground/10 text-primary-foreground'
									: 'bg-primary/10 text-primary group-hover:bg-primary/20'
							"
						>
							<FileIcon class="w-4 h-4" />
						</div>
						<div class="flex-1 overflow-hidden">
							<div class="text-xs font-medium truncate">Файл вложения</div>
							<div class="text-[10px] opacity-70">Нажмите чтобы скачать</div>
						</div>
						<Download class="w-4 h-4 opacity-70" />
					</a>
				</div>

				<p v-if="message.text" class="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
					{{ message.text }}
				</p>
			</div>

			<div class="px-3 pb-1.5 text-[10px] text-right opacity-60 select-none font-medium">
				{{ formatTime(message.createdAt) }}
			</div>
		</div>
	</div>
</template>
