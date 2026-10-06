<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { RouterView } from 'vue-router'
import 'vue-sonner/style.css'
</script>

<template>
	<div>
		<RouterView />

		<Toaster
			position="top-center"
			:toast-options="{
				unstyled: true,
				classes: {
					toast: `
            group toast relative flex w-full items-start gap-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all
            bg-background text-foreground

            /* Default styling */
            border-border shadow-black/5

            /* ERROR STATE: Red border, Red Icon, Red Glow */
            data-[type=error]:border-destructive
            data-[type=error]:shadow-[0_4px_14px_0_var(--destructive)]/10
          `,

					title: 'text-sm font-semibold leading-none',
					description: 'text-sm text-muted-foreground mt-1.5',

					icon: 'text-lg data-[type=error]:text-destructive',

					actionButton:
						'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent px-3 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton:
						'bg-muted text-muted-foreground hover:bg-secondary inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent px-3 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',

					closeButton:
						'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
				},
			}"
		/>
	</div>
</template>
