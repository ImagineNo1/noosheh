import React from 'react';
export const Select=({children}:any)=><div>{children}</div>;
export const SelectTrigger=({children,...p}:any)=><div {...p}>{children}</div>;
export const SelectValue=({placeholder}:any)=><span>{placeholder}</span>;
export const SelectContent=({children}:any)=><div>{children}</div>;
export const SelectItem=({children,...p}:any)=><div {...p}>{children}</div>;
