import { router } from "../server";
import { jobRouter } from "./job";
import { applicationRouter } from "./application";
import { shareRouter } from "./share";

export const appRouter = router({
  job: jobRouter,
  application: applicationRouter,
  share: shareRouter,
});

export type AppRouter = typeof appRouter;