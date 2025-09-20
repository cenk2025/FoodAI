// Type definitions for process.env
declare const process: {
  env: {
    [key: string]: string | undefined;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  };
};

// Basic JSX intrinsic elements declaration
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Basic React types
declare module 'react' {
  export const useState: any;
  export const useEffect: any;
  export const useContext: any;
  export const useReducer: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useRef: any;
  export const useImperativeHandle: any;
  export const useLayoutEffect: any;
  export const useDebugValue: any;
  export const Fragment: any;
  export const createElement: any;
  export const cloneElement: any;
  export const isValidElement: any;
  export const createContext: any;
  export const forwardRef: any;
  export const memo: any;
  export default any;
}