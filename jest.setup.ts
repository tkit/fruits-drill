import "@testing-library/jest-dom";

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Mock Grafana Faro
jest.mock("@grafana/faro-web-sdk", () => ({
  initializeFaro: jest.fn(),
  getWebInstrumentations: jest.fn(() => []),
  Faro: jest.fn(),
}));

jest.mock("@grafana/faro-web-tracing", () => ({
  TracingInstrumentation: jest.fn(),
}));
