import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth/session";
import "./page.css";

export const metadata: Metadata = {
  title: "Student Login",
  description: "Access the campus operations dashboard with your enrollment number.",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-copy">
          <div className="login-eyebrow">Neon + Prisma Ready</div>
          <h2>Production-backed student access is now part of the app flow.</h2>
          <p>
            Your registrar CSV is seeded into Postgres, and the dashboard loads
            live resident data after sign-in instead of a hardcoded demo user.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
