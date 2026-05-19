import React from 'react';
export const Tabs=({children}:any)=><div>{children}</div>;export const TabsList=({children,...p}:any)=><div {...p}>{children}</div>;export const TabsTrigger=({children,...p}:any)=><button {...p}>{children}</button>;export const TabsContent=({children,...p}:any)=><div {...p}>{children}</div>;
