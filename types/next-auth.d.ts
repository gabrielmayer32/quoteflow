import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      paymentStatus: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    paymentStatus: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    paymentStatus: string;
  }
}
