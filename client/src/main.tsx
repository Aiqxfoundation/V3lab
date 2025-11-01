import { Buffer } from 'buffer';
import process from 'process';
import assert from 'assert';

// Set up Buffer and process polyfills BEFORE any other imports
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Polyfill for assert.strict
if (!(assert as any).strict) {
  (assert as any).strict = assert;
}

// Polyfill for process with full browser compatibility
if (typeof window !== 'undefined') {
  (window as any).process = process;
  (window as any).global = window;
  
  // Ensure process.env exists
  if (!process.env) {
    process.env = {};
  }
  process.env.NODE_ENV = import.meta.env.MODE;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
