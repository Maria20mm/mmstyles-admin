import { authMiddleware } from "@clerk/nextjs/server";

 
export default authMiddleware({
  publicRoutes: [
    "/api/:path*",
    "/",
    "/collections(.*)",
    "/products(.*)",
    "/orders(.*)",
    "/customers(.*)",
  ],

    ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\.[\w]+$)"]
  

});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
