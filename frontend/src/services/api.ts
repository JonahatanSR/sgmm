export async function apiGet<T>(path: string): Promise<T> {
  console.log('🌐 [API DEBUG] Making GET request to:', path);
  const res = await fetch(path);
  console.log('🌐 [API DEBUG] Response status:', res.status, 'for path:', path);
  if (!res.ok) {
    console.error('❌ [API DEBUG] Request failed:', res.status, 'for path:', path);
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  console.log('✅ [API DEBUG] Request successful for path:', path, 'data:', data);
  return data;
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiPut<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}


