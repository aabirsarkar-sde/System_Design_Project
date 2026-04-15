import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth/session";
import "./page.css";

export const metadata: Metadata = {
  title: "Student Login",
  description:
    "Access the campus operations workspace to review seating and track service requests.",
};

const loginHighlights = [
  {
    title: "Contest-ready resident access",
    description:
      "Students can enter the workspace, verify seating allocation, and raise support issues without switching tools.",
  },
  {
    title: "Operational response in one console",
    description:
      "Requests, facilities, analytics, and dispatch signals stay connected across the full experience.",
  },
  {
    title: "Production-backed data flow",
    description:
      "Prisma and PostgreSQL now drive the platform instead of a temporary in-memory demo state.",
  },
];

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="login-page">
      <div className="login-stage animate-fade-in">
        <section className="login-showcase">
          <div className="eyebrow">NST Operations</div>
          <h2>Professional service workflows for students, facilities, and contest support.</h2>
          <p>
            This workspace is designed for fast issue reporting, clearer
            operational visibility, and reliable access to student-specific
            contest logistics.
          </p>

          <div className="login-highlights">
            {loginHighlights.map((item, index) => (
              <article
                key={item.title}
                className={`login-highlight animate-slide-up delay-${(index + 1) * 100}`}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}
