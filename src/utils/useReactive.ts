import { useState } from "react";

export function useReactive<T = undefined>(): {
  value: T | undefined;
  set: (x: T | undefined | ((y: T | undefined) => T | undefined)) => void;
};
export function useReactive<T>(initialValue: T): {
  value: T;
  set: (x: T | ((y: T) => T)) => void;
};
export function useReactive<T>(initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(initialValue);

  const set = (cbOrValue: T | ((prev: T | undefined) => T)) => {
    if (typeof cbOrValue === "function") {
      const cb = cbOrValue as (prev: T | undefined) => T;
      setValue((prevValue) => cb(prevValue)); // cast to function type
    } else {
      setValue(cbOrValue);
    }
  };

  return { value, set };
}

export const $ = useReactive;
