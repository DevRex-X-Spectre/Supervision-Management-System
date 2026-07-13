import { cn, initials } from "@/lib/utils";

export function Avatar({
  firstName,
  lastName,
  src,
  className,
}: {
  firstName: string;
  lastName: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn("h-9 w-9 rounded-full object-cover ring-2 ring-white", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-naub-green text-xs font-semibold text-white ring-2 ring-white",
        className
      )}
      aria-hidden
    >
      {initials(firstName, lastName)}
    </div>
  );
}
