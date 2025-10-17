const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY;

if (!projectId || !publicAnonKey) {
    console.error("Supabase configuration missing in environment variables. API calls may fail.");
}

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-da4e929c`;

/**
 * A generic API client for making fetch requests.
 * @param endpoint The API endpoint to call (e.g., '/characters').
 * @param options The standard fetch RequestInit options.
 */
export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers, mode: 'cors' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error on ${endpoint}: ${response.status} - ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error(`API Client Error on ${endpoint}:`, error);
        throw error; // Re-throw the error to be handled by the caller
    }
};