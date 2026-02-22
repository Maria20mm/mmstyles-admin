"use client";

import { useEffect, useRef } from "react";

export const useLiveUpdates = (onTick: () => void) => {
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    const id = window.setInterval(() => {
      onTickRef.current();
    }, 5000);

    return () => {
      window.clearInterval(id);
    };
  }, []);
};
