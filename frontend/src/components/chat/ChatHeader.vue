<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/chatUtils'

defineProps<{
	name: string
}>()
</script>

<template>
	<header class="h-16 border-b shrink-0 flex items-center px-6 bg-background/80 backdrop-blur z-20">
		<div class="flex items-center gap-3">
			<Avatar class="h-9 w-9 border">
				<AvatarFallback class="bg-primary/10 text-primary text-xs">
					{{ getInitials(name) }}
				</AvatarFallback>
			</Avatar>
			<div>
				<h3 class="font-semibold text-sm leading-none mb-1">{{ name }}</h3>
			</div>
		</div>
	</header>
</template>
