const toEntity = (name: string) => ({
  async list(sort?: string, limit?: number) {
    const sp = new URLSearchParams();
    if (sort) sp.set('sort', sort);
    if (limit) sp.set('limit', String(limit));
    const res = await fetch(`/api/admin/entities/${name}${sp.toString() ? `?${sp}` : ''}`);
    return res.json();
  },
  async filter(query: Record<string, any>, sort?: string, limit?: number) {
    const rows = await this.list(sort, limit);
    return rows.filter((r: any) => Object.entries(query).every(([k,v]) => r[k] === v));
  },
  async create(data: any) { const res = await fetch(`/api/admin/entities/${name}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); return res.json(); },
  async update(id: string, data: any) { const res = await fetch(`/api/admin/entities/${name}/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); return res.json(); },
  async delete(id: string) { const res = await fetch(`/api/admin/entities/${name}/${id}`, { method:'DELETE' }); return res.json(); }
});
export const base44 = { entities: { BlogPost: toEntity('BlogPost'), BlogCategory: toEntity('BlogCategory'), BlogTag: toEntity('BlogTag'), BlogComment: toEntity('BlogComment'), BlogPage: toEntity('BlogPage') }, integrations:{ Core:{ async UploadFile({file}:{file:File}){ const form=new FormData(); form.append('file',file); const res=await fetch('/api/admin/upload',{method:'POST',body:form}); const data=await res.json(); return { file_url: data.url || data.file_url || ''};}}}};
