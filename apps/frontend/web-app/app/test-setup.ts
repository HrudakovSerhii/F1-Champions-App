import '@testing-library/jest-dom';

// Polyfill for React 18 testing
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
