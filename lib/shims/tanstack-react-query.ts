export function useQuery(_: any){ return { data: [], isLoading:false }; }
export function useMutation({ mutationFn, onSuccess }: any){ return { mutate: async (a:any)=>{ const r=await mutationFn(a); onSuccess?.(r); return r; }, mutateAsync: async (a:any)=>{ const r=await mutationFn(a); onSuccess?.(r); return r; } }; }
export function useQueryClient(){ return { invalidateQueries: ()=>{} }; }
