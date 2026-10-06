import axios, { type AxiosInstance, type InternalAxiosRequestConfig, isAxiosError } from 'axios'
import { shallowRef } from 'vue'

type LoginRequestDto = { email: string; password: string }
type RegisterRequestDto = { email: string; password: string }
type LoginResponseDto = { accessToken: string; expiresIn: number; refreshToken: string }
type RefreshRequestDto = { refreshToken: string }
type RefreshResponseDto = { accessToken: string; expiresIn: number; refreshToken: string }

export class AuthService {
	private readonly ax: AxiosInstance
	private readonly LocalStorageKeyToken = '__accessToken'
	private readonly LocalStorageKeyTokenRenew = '__accessTokenRenew'
	private readonly LocalStorageKeyTokenExpires = '__accessTokenExpires'

	public isLoggedIn = shallowRef<boolean>(false)

	private _renewTokenPromise: Promise<boolean> | null = null

	constructor() {
		this.ax = axios.create({
			baseURL: import.meta.env.VITE_API_URL + '/api/auth' || 'http://localhost:5042/api/auth',
		})
		this.init()
	}

	private init = (): void => {
		this.isLoggedIn.value = !!this.getAccessToken() && !this.isAccessTokenExpired()
	}

	public login = async (dto: LoginRequestDto): Promise<LoginResponseDto> => {
		const { data } = await this.ax.post<LoginResponseDto>('/login', dto)
		this.setTokens(data)
		localStorage.setItem('__userEmail', dto.email) // I know, I know
		this.isLoggedIn.value = true
		return data
	}

	public register = async (dto: RegisterRequestDto): Promise<void> => {
		await this.ax.post('/register', dto)
	}

	public logout = (): void => {
		this.removeTokens()
		this.isLoggedIn.value = false
	}

	public renewToken = (): Promise<boolean> => {
		if (!this._renewTokenPromise) {
			this._renewTokenPromise = this.renewTokenInternal().finally(() => {
				this._renewTokenPromise = null
			})
		}
		return this._renewTokenPromise
	}

	private renewTokenInternal = async (): Promise<boolean> => {
		const refreshToken = this.getRenewToken()
		if (!refreshToken) return this.handleAuthenticationFailure()

		try {
			const dto = { refreshToken } satisfies RefreshRequestDto
			const { data } = await this.ax.post<RefreshResponseDto>('/refresh', dto)
			this.setTokens(data)
			this.isLoggedIn.value = true
			return true
		} catch (error) {
			if (isAxiosError(error) && error.response?.status === 401) {
				this.logout()
				return this.handleAuthenticationFailure()
			}
			return false
		}
	}

	public getVerifiedAccessToken = async (): Promise<string | null> => {
		const token = this.getAccessToken()

		if (!token || this.isAccessTokenExpired()) {
			const success = await this.renewToken()
			return success ? this.getAccessToken() : null
		}
		return token
	}

	public addAxiosInterceptor = (axi: AxiosInstance): void => {
		axi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
			if (config.baseURL === this.ax.defaults.baseURL) return config

			const token = await this.getVerifiedAccessToken()
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
			return config
		})

		axi.interceptors.response.use(undefined, async (error) => {
			const originalConfig = error.config
			const isAuthError = error.response?.status === 401
			const canRetry = !originalConfig._retry && originalConfig.baseURL !== this.ax.defaults.baseURL

			if (isAuthError && canRetry) {
				originalConfig._retry = true
				if (await this.renewToken()) {
					originalConfig.headers.Authorization = `Bearer ${this.getAccessToken()}`
					return axi(originalConfig)
				}
			}
			return Promise.reject(error)
		})
	}

	private handleAuthenticationFailure = (): Promise<boolean> => {
		return Promise.resolve(false)
	}

	public getAccessToken = (): string | null => localStorage.getItem(this.LocalStorageKeyToken)
	private getRenewToken = (): string | null => localStorage.getItem(this.LocalStorageKeyTokenRenew)

	private isAccessTokenExpired = (): boolean => {
		const expires = localStorage.getItem(this.LocalStorageKeyTokenExpires)
		return !expires || Date.now() > parseInt(expires, 10) - 10000
	}

	private setTokens = (tokens: LoginResponseDto): void => {
		const expires = Date.now() + tokens.expiresIn * 1000
		localStorage.setItem(this.LocalStorageKeyToken, tokens.accessToken)
		localStorage.setItem(this.LocalStorageKeyTokenRenew, tokens.refreshToken)
		localStorage.setItem(this.LocalStorageKeyTokenExpires, expires.toString())
	}

	private removeTokens = (): void => {
		localStorage.removeItem(this.LocalStorageKeyToken)
		localStorage.removeItem(this.LocalStorageKeyTokenRenew)
		localStorage.removeItem(this.LocalStorageKeyTokenExpires)
	}
}

export const auth = new AuthService()
