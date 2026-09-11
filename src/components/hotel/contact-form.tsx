"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Unable to send message.");
          return;
        }
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-none bg-white"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none bg-white"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-none bg-white"
          placeholder="Dining, spa, accessibility…"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32 rounded-none bg-white"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-fit rounded-none bg-[var(--hm-sea)] px-8 text-white hover:bg-[var(--hm-sea)]/90"
      >
        {pending ? "Sending…" : "Send message"}
      </Button>
      {error ? (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className="border border-[var(--hm-sea)]/30 bg-[var(--hm-mist)] px-4 py-3 text-sm text-[var(--hm-ink)]"
        >
          Message received. Our concierge will reply within one business day.
        </p>
      ) : null}
    </form>
  );
}
