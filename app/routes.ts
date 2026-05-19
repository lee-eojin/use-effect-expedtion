import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

const MEMBERS = ["antoliny", "dium", "kob", "less", "peat"] as const;

export default [
  index("routes/home.tsx"),
  ...prefix("problem/", MEMBERS.map((name) => route(`${name}/`, `problems/${name}/problem.jsx`))),
  ...prefix("solve/", MEMBERS.map((name) => route(`${name}/`, `problems/${name}/solve.jsx`))),
] satisfies RouteConfig;
