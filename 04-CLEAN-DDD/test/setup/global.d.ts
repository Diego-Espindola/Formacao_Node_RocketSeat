import "vitest";

declare global {
  const describe: typeof import("vitest")["describe"];
  const it: typeof import("vitest")["it"];
  const expect: typeof import("vitest")["expect"];
  const beforeEach: typeof import("vitest")["expect"];
}