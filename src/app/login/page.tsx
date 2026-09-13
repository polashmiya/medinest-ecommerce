import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { LoginView } from "@/components/account/login-view";

export const metadata = pageMetadata({ title: "Login or sign up", path: routes.login(), noindex: true });

/** Only same-site relative paths are allowed as the post-login destination. */
function safeNext(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : routes.account();
}

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  return <LoginView next={safeNext(sp.next)} />;
}
