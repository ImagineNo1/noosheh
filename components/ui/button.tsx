import React from 'react'; export const Button=({asChild,children,...p}:any)=>{const C=asChild?'span':'button'; return <C {...p}>{children}</C>};
