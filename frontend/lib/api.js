// Default to relative paths so Next.js rewrites can proxy to Django; override with NEXT_PUBLIC_API_BASE if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

async function request(path, options = {}) {
  const url = API_BASE ? `${API_BASE}${path}` : path;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_err) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && (data.detail || data.error)) || response.statusText || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function fetchProducts() {
  return request("/api/products/");
}

export async function createProduct(fields) {
  return request("/api/products/", {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

export async function updateProduct(id, fields) {
  return request(`/api/products/${id}/`, {
    method: "PUT",
    body: JSON.stringify({ fields }),
  });
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}/`, { method: "DELETE" });
}
