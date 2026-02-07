"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  return (
    <Button
      className="dark:bg-gray-800 dark:text-white text-black border-2 bg-gray-400 "
      onClick={() => {
        signIn("google");
      }}
    >
      {text}
    </Button>
  );
};

export default SignInButton;
