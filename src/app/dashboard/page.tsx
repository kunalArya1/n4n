import { UserButton } from "@clerk/nextjs";
import { currentUser, auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await currentUser();
  const session = await auth();
  return (
    <div className="flex justify-between p-5">
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      Welcome {user?.firstName}
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
