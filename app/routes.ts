import {
  type RouteConfig,
  index,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("problem/", [
    route("antoliny/", "problems/antoliny.jsx"),
    route("dium/", "problems/dium.jsx"),
    route("kob/", "problems/kob.jsx"),
    route("less/", "problems/less.jsx"),
    route("peat/", "problems/peat.jsx"),
  ]),
];
