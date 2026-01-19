/// <reference types="vite/client" />

declare module '*.jsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

declare module '@/App' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

declare module '@/*' {
  const value: string;
  export default value;
}

declare module './App' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

declare module './App.jsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}
