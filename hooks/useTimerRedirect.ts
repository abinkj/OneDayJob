import { useEffect } from "react";
import { router, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { useActiveJob } from "./useActiveJob";

/**
 * Hook to automatically redirect workers to the Job Timer screen
 * if they have an active work session running.
 */
export const useTimerRedirect = () => {
  const activeJobState = useActiveJob();
  const userData = useSelector((state: any) => state.authentication.userData);
  const userId = userData?.id || userData?._id;
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if:
    // 1. We have an active job
    // 2. User is logged in
    // 3. Current path is NOT already the Job Timer screen
    // 4. User is NOT the employer (only force for workers)

    if (activeJobState.job && userId && !activeJobState.loading) {
      const jobCreatorId =
        typeof activeJobState.job.userId === "object" &&
        activeJobState.job.userId !== null
          ? activeJobState.job.userId.id || activeJobState.job.userId._id
          : activeJobState.job.userId;

      const isEmployer = jobCreatorId === userId;

      // Strict check: if user is accepted worker on an in-progress job
      if (!isEmployer && pathname !== "/main/jobTimer") {
        console.log(
          "🔄 [useTimerRedirect] Active job detected, redirecting to Timer screen..."
        );
        router.replace({
          pathname: "/main/jobTimer",
          params: { jobId: activeJobState.job._id },
        });
      }
    }
  }, [activeJobState.job, activeJobState.loading, userId, pathname]);

  return activeJobState;
};
