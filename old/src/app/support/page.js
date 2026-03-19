"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function SupportPage() {
  useEffect(() => {
    // Redirect to contact page
    redirect("/contact");
  }, []);

  return null;
}
