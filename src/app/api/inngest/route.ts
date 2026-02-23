import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { evaluateAttemptBackground } from "@/inngest/functions/evaluate-attempt";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [evaluateAttemptBackground],
});
