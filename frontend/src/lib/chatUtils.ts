const apiUrl = import.meta.env.VITE_API_URL

export function getInitials(name?: string) {
	if (!name) return '??'
	return name.substring(0, 2).toUpperCase()
}

export function formatTime(dateStr: string) {
	return new Date(dateStr).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	})
}

export function getFileUrl(path?: string) {
	if (!path) return ''
	if (path.startsWith('http')) return path
	const base = apiUrl.replace(/\/$/, '')
	const relative = path.replace(/^\//, '')
	return `${base}/${relative}`
}
