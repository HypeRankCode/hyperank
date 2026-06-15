"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AgeGateProps {
  onComplete: (result: {
    ageBracket: "blocked" | "minor" | "adult";
    parentEmail?: string;
  }) => void;
}

export function AgeGate({ onComplete }: AgeGateProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [error, setError] = useState("");
  const [needsParentEmail, setNeedsParentEmail] = useState(false);

  function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    if (isNaN(birthDate.getTime())) {
      setError("Enter a valid date.");
      return;
    }

    const age = calculateAge(birthDate);

    if (age < 13) {
      onComplete({ ageBracket: "blocked" });
      return;
    }

    if (age < 18) {
      if (!needsParentEmail) {
        setNeedsParentEmail(true);
        return;
      }
      if (!parentEmail || !parentEmail.includes("@")) {
        setError("Parent or guardian email required.");
        return;
      }
      onComplete({ ageBracket: "minor", parentEmail });
      return;
    }

    onComplete({ ageBracket: "adult" });
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>How old are you?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                placeholder="DD"
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                placeholder="MM"
                maxLength={2}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          {needsParentEmail && (
            <div>
              <Label htmlFor="parentEmail">Parent or guardian email</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@email.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                We&apos;ll send a confirmation link before your account is
                activated.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-hype">{error}</p>}

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
