import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // API・管理画面・静的ファイル・Next内部パスを除くすべてにロケールルーティングを適用
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
