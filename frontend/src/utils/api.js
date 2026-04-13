const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export async function putJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

export async function deleteJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Request failed.';
    throw new Error(message);
  }

  return data;
}