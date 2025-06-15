"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, isAuthenticated, authChecked } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push("/auth/login?from=/settings");
    } else if (user) {
      setName(user.name);
    }
  }, [authChecked, isAuthenticated, user, router]);

  const onSave = () => {
    // placeholder save logic
    setMessage("Settings saved successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  if (!authChecked || !isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <PageHeader title="Settings" subtitle="Manage your preferences" />
      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {message && <p className="text-green-600">{message}</p>}
          <Button onClick={onSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
