import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  Note,
  CreateNoteDto,
  UpdateNoteDto,
  ApiError
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<{ user: any }> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Notes endpoints
  async getNotes(tags?: string[]): Promise<Note[]> {
    const params = tags && tags.length > 0 ? { tags: tags.join(',') } : {};
    const response = await this.api.get<Note[]>('/notes', { params });
    return response.data;
  }

  async getNote(id: string): Promise<Note> {
    const response = await this.api.get<Note>(`/notes/${id}`);
    return response.data;
  }

  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await this.api.post<Note>('/notes', data);
    return response.data;
  }

  async updateNote(id: string, data: UpdateNoteDto): Promise<Note> {
    const response = await this.api.patch<Note>(`/notes/${id}`, data);
    return response.data;
  }

  async deleteNote(id: string): Promise<void> {
    await this.api.delete(`/notes/${id}`);
  }
}

export const apiService = new ApiService();
export default apiService;
