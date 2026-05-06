"use client";

import { useEffect } from "react";
import { initScrollReveal } from "@/lib/scrollReveal";

export default function ScrollRevealInit() {
  useEffect(() => {
    const cleanup = initScrollReveal();
    return cleanup;
  }, []);

  return null;
}
