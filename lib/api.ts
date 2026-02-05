const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

class ApiClient {
    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // If body is FormData, let browser set Content-Type (by removing it)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const config: RequestInit = {
            ...options,
            headers,
            credentials: 'include',
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const data = await response.json();
                errorMessage = data.detail || errorMessage;
            } catch (e) {
                // ignore JSON parse error
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {} as T;
        }

        // Check if response has content to parse
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    get<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body?: any, options?: RequestOptions) {
        const isFormData = body instanceof FormData;
        const payload = isFormData ? body : JSON.stringify(body);

        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: payload
        });
    }

    put<T>(endpoint: string, body?: any, options?: RequestOptions) {
        const isFormData = body instanceof FormData;
        const payload = isFormData ? body : JSON.stringify(body);

        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: payload
        });
    }

    delete<T>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiClient();
