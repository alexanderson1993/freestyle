import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { Button, buttonVariants } from "~/components/ui/button";
import { Form, href, Link } from "react-router";
import type { User } from "~/utils/auth.server";

export function Welcome({
  message,
  user,
}: {
  message: string;
  user: User | undefined;
}) {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          {user ? (
            <>
              <p>Signed in as {user.name || user.email}</p>
              {user.image ? (
                <img src={user.image} alt="User" className="size-16" />
              ) : null}
              <Form method="POST" action="/api/logout">
                <Button variant="secondary" type="submit" className="w-full">
                  Logout
                </Button>
              </Form>
            </>
          ) : (
            <>
              {" "}
              <Link
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-full",
                })}
                to={href("/sign-in")}
              >
                Sign In
              </Link>
              <Link
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-full",
                })}
                to={href("/sign-up")}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
