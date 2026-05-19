import React from 'react'; export const Checkbox=({checked,onCheckedChange}:any)=><input type='checkbox' checked={!!checked} onChange={e=>onCheckedChange?.(e.target.checked)} />;
