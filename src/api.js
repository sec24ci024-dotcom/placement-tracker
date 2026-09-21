const API_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}, token) {

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",

                    ...(token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {}),

                    ...options.headers,
                },
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {

            const error = new Error(
                data.message ||
                `Request failed with status ${response.status}`
            );

            error.status = response.status;

            throw error;
        }

        return data;

    } catch (error) {

        if (error.status) {
            throw error;
        }

        const networkError = new Error(
            "Unable to connect to the server. Please try again."
        );

        networkError.status = 0;

        throw networkError;
    }
}

export function loginUser(email, password) {

    return request(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password,
            }),
        }
    );
}

export function registerUser(name, email, password) {

    return request(
        "/auth/register",
        {
            method: "POST",

            body: JSON.stringify({
                name,
                email,
                password,
            }),
        }
    );
}

export function getTasks(token) {

    return request(
        "/tasks",
        {},
        token
    );
}

export function createTask(
    category,
    name,
    token
) {

    return request(
        "/tasks",
        {
            method: "POST",

            body: JSON.stringify({
                category,
                name,
            }),
        },
        token
    );
}

export function updateTask(
    taskId,
    updates,
    token
) {

    return request(
        `/tasks/${taskId}`,
        {
            method: "PUT",

            body: JSON.stringify(updates),
        },
        token
    );
}

export function deleteTask(
    taskId,
    token
) {

    return request(
        `/tasks/${taskId}`,
        {
            method: "DELETE",
        },
        token
    );
}

export function askAI(
    message,
    token
) {

    return request(
        "/ai/assistant",
        {
            method: "POST",

            body: JSON.stringify({
                message,
            }),
        },
        token
    );
}