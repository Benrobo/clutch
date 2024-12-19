import type { Context, Hono } from "hono";

export type CustomContext = Context & {
  // custom get
  get(key: "user"): User;

  // custom set
  set(key: "user", value: User): void;

  // default set& get
  get(key: string): any;
  set(key: string, value: any): void;
};
