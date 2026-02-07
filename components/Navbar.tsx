import { getAuthSession } from "@/lib/nextauth";
import Link from "next/link";
import UserAccount from "./UserAccount";
import SignInButton from "./SignInButton";

type Props = {};

const Navbar = async (props: Props) => {
  const session = await getAuthSession();

  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-10 border-b border-zinc-400 py-4 ">
      <div className="flex items-center justify-between h-4 gap-2 px-8 mx-auto max-w-7xl">
        <Link href={"/"} className="flex items-center gap-2">
          <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:translate-y-[2px] md:block dark:border-white ">
            Spend Stats
          </p>
        </Link>
        <div className="flex items-center">
          <div className="flex items-center">
            {session?.user ? (
              <UserAccount user={session.user} />
            ) : (
              <SignInButton text="Sign In" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
