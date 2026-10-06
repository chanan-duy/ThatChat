import axios, { isAxiosError, type AxiosInstance } from 'axios'
import { toast } from 'vue-sonner'
import { auth, type AuthService } from './authService'

const ApiBase: string = import.meta.env.VITE_API_URL || 'http://localhost:5042'

export type ChatDto = { id: string; name: string; isGlobal: boolean }
export type MessageDto = {
	id: string
	chatId: string
	senderId: string
	senderEmail?: string
	text?: string
	fileUrl?: string
	createdAt: string
}
export type UploadResponseDto = { url: string }

export class ApiService {
	private ax: AxiosInstance = axios.create({
		baseURL: ApiBase + '/api',
	})
	private auth: AuthService

	constructor(authService: AuthService) {
		this.auth = authService
		auth.addAxiosInterceptor(this.ax)

		this.ax.interceptors.response.use(
			function onFulfilled(response) {
				return response
			},
			function onRejected(error) {
				if (isAxiosError(error)) {
					if (error.code === 'ERR_NETWORK') {
						toast.error('Ошибка при отправке запроса на сервер', {
							description: 'Проверьте подключение к интернету. Или возможно сервер недоступен.',
							duration: Infinity,
						})
					}
				}

				return Promise.reject(error)
			},
		)
	}

	public async getChats(): Promise<ChatDto[]> {
		const { data } = await this.ax.get<ChatDto[]>('/chats')
		return data
	}

	public async createChat(email: string): Promise<ChatDto> {
		const { data } = await this.ax.post<ChatDto>('/chats', { email })
		return data
	}

	public async getChatMessages(chatId: string): Promise<MessageDto[]> {
		const { data } = await this.ax.get<MessageDto[]>(`/chats/${chatId}/messages`)
		return data
	}

	public async uploadFile(file: File): Promise<string> {
		const formData = new FormData()
		formData.append('file', file)

		const { data } = await this.ax.post<UploadResponseDto>('/upload', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return data.url
	}
}

export const api = new ApiService(auth)
