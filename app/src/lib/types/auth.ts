export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  verified: boolean;
  subscription_plan: "FREE" | "BASIC" | "PRO";
  project_count: number;
};
