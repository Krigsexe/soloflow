import { loggerLink } from "@trpc/client";
import { experimental_createTRPCNextAppDirClient } from "@trpc/next/app-dir/client";

import type { AppRouter } from "@soloflow/api";

import { endingLink, transformer } from "./shared";

export const trpc = experimental_createTRPCNextAppDirClient<AppRouter>({
  config() {
    return {
      transformer,
      links: [
        // loggerLink({
        //   enabled: (opts) =>
        //     process.env.NODE_ENV === "development" ||
        //     (opts.direction === "down" && opts.result instanceof Error),
        // }),
        loggerLink({
          enabled: () => true,
        }),
        endingLink({
          headers: {
            "x-trpc-source": "client",
          },
        }),
      ],
    };
  },
});

export { type RouterInputs, type RouterOutputs } from "@soloflow/api";
