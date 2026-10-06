<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getInitials } from '@/lib/chatUtils'
import type { ChatDto } from '@/services/apiService'
import { CircleDot, LogOut } from 'lucide-vue-next'
import CreateChatDialog from './CreateChatDialog.vue'

defineProps<{
	chats: ChatDto[]
	activeChatId: string | null
}>()

const emit = defineEmits<{
	(e: 'select', id: string): void
	(e: 'create', email: string): void
	(e: 'logout'): void
}>()
</script>

<template>
	<aside class="w-80 border-r flex flex-col bg-card/30 shrink-0">
		<div class="p-4 border-b flex items-center justify-between h-16 shrink-0">
			<h2 class="font-semibold text-lg tracking-tight">Чаты</h2>
			<div class="flex gap-1">
				<CreateChatDialog @create="(email) => emit('create', email)" />
				<Button variant="ghost" size="icon" @click="emit('logout')" title="Выйти" class="h-8 w-8">
					<LogOut class="w-4 h-4 text-muted-foreground hover:text-destructive" />
				</Button>
			</div>
		</div>

		<ScrollArea class="flex-1">
			<div class="flex flex-col gap-1 p-2">
				<button
					v-for="chat in chats"
					:key="chat.id"
					@click="emit('select', chat.id)"
					:class="[
						'flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200',
						activeChatId === chat.id
							? 'bg-secondary text-secondary-foreground shadow-sm'
							: 'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
					]"
				>
					<Avatar class="w-10 h-10 border shadow-sm">
						<AvatarFallback class="bg-background text-foreground/80 text-xs font-medium">
							{{ getInitials(chat.name) }}
						</AvatarFallback>
					</Avatar>
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm truncate leading-none mb-1">
							{{ chat.name || 'Без названия' }}
						</div>
						<div class="text-[11px] opacity-70 font-normal flex items-center gap-1">
							<CircleDot
								:class="chat.isGlobal ? 'text-blue-500' : 'text-green-500'"
								fill="currentColor"
								class="w-2 h-2"
							/>
							{{ chat.isGlobal ? 'Глобальный' : 'Личный' }}
						</div>
					</div>
				</button>
			</div>
		</ScrollArea>
	</aside>
</template>
