"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function JobRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.jobId) {
      router.replace(`/jobs/${params.jobId}`);
    } else {
      router.replace("/jobs");
    }
  }, [params.jobId, router]);

  return null;
}
