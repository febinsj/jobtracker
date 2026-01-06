import { router } from "../server";
import { jobRouter } from "./job";
import { applicationRouter } from "./application";
import { shareRouter } from "./share";
import { userRouter } from "./user";

export const appRouter = router({
  job: jobRouter,
  application: applicationRouter,
  share: shareRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;