import { User } from "next-auth";

import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";

type Props = {
  user: Pick<User, "image" | "name">;
};

const UserAvatar = ({ user }: Props) => {
  return (
    <Avatar>
      {user.image ? (
        <div className="relative aspect-square ">
          <Image
            src={user.image}
            alt="profile"
            referrerPolicy="no-referrer"
            width={60}
            height={60}
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
