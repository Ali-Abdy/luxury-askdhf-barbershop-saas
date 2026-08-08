import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { AnimatedPage } from "@/components/shared/animated-page";

export default function LoginPage() {
  return (
    <PageWrapper>
      <AnimatedPage>
        <Section className="py-24">
          <Container className="max-w-md">
            <h1 className="text-3xl font-light mb-8 text-center">Sign In</h1>
            <form
                action={async (formData) => {
                  "use server";
                  await signIn("credentials", formData);
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-medium text-neutral-500">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                  autoComplete="email"
                  placeholder="Email"
                  className="w-full p-4 border border-neutral-200 rounded-lg focus:outline-amber-600"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-medium text-neutral-500">Password</label>
                  <input 
                    name="password" 
                    type="password" 
                  autoComplete="current-password"
                  placeholder="Password"
                  className="w-full p-4 border border-neutral-200 rounded-lg focus:outline-amber-600"
                    required 
                  />
                </div>
              <Button type="submit" className="w-full bg-neutral-900 py-6 text-lg rounded-lg">
                  Sign In
                </Button>
              </form>

            <div className="mt-8 pt-8 border-t border-neutral-200 space-y-4">
              <form action={async () => { "use server"; await signIn("google"); }}>
                <Button type="submit" variant="outline" className="w-full py-6 text-lg">Continue with Google</Button>
              </form>
              <form action={async () => { "use server"; await signIn("apple"); }}>
                <Button type="submit" variant="outline" className="w-full py-6 text-lg">Continue with Apple</Button>
              </form>
            </div>
          </Container>
        </Section>
      </AnimatedPage>
    </PageWrapper>
  );
}

