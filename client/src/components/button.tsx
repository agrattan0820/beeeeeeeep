import { cn } from "@ai/utils/cn";
import Link, { LinkProps } from "next/link";
import { ButtonHTMLAttributes, LinkHTMLAttributes } from "react";

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={cn(
        `bg-indigo-600 px-4 text-white transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${
          props.className ?? ""
        }`
      )}
    />
  );
};

export const SecondaryButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  return (
    <button
      {...props}
      className={cn(
        `bg-gray-300 px-4 transition hover:bg-gray-200 active:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 ${
          props.className ?? ""
        }`
      )}
    />
  );
};

export const LinkButton = (
  props: LinkProps & LinkHTMLAttributes<HTMLAnchorElement>
) => {
  return (
    <Link
      {...props}
      className={cn(
        `bg-indigo-600 px-4 text-white transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 ${
          props.className ?? ""
        }`
      )}
    />
  );
};

export default Button;