const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(
            data.message || "Something went wrong"
        );

        error.status = response.status;

        throw error;
    }

    return data;
}

export function getTasks(token) {
    return request("/tasks", {}, token);
}

export function createTask(category, name, token) {
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

export function updateTask(taskId, updates, token) {
    return request(
        `/tasks/${taskId}`,
        {
            method: "PUT",
            body: JSON.stringify(updates),
        },
        token
    );
}

export function deleteTask(taskId, token) {
    return request(
        `/tasks/${taskId}`,
        {
            method: "DELETE",
        },
        token
    );
}