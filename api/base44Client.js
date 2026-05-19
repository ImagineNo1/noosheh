const API_BASE = '/api/blog';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function encodeQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function entity(name) {
  return {
    list(sort, limit) {
      return request(`/${name}${encodeQuery({ sort, limit })}`);
    },
    filter(filterObj = {}, sort, limit) {
      return request(`/${name}${encodeQuery({ filter: filterObj, sort, limit })}`);
    },
    create(data) {
      return request(`/${name}`, { method: 'POST', body: JSON.stringify(data) });
    },
    update(id, data) {
      return request(`/${name}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    delete(id) {
      return request(`/${name}/${id}`, { method: 'DELETE' });
    },
  };
}

export const base44 = {
  entities: {
    BlogPost: entity('posts'),
    BlogCategory: entity('categories'),
    BlogTag: entity('tags'),
    BlogComment: entity('comments'),
  },
};
