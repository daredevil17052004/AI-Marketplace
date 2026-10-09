"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RunRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.agentId) {
      router.replace(`/agents/${params.agentId}`);
    } else {
      router.replace("/agents");
    }
  }, [params.agentId, router]);

  return null;
}
