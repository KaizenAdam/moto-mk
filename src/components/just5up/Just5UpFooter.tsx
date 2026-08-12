import Image from "next/image";
import { j5u } from "@/lib/just5up-theme";

export default function Just5UpFooter() {
  return (
    <footer className="border-t-2" style={{ background: j5u.card, borderColor: j5u.goldDeep }}>
      <div className="w-full px-4 md:px-8 py-6 flex items-center h-16">
        <Image
          src="/brand/just5up-mark.png"
          alt="Just5Up!"
          width={640}
          height={511}
          className="h-12 w-auto"
        />
      </div>
      <div
        className="border-t px-4 md:px-8 py-4 text-xs text-center"
        style={{ borderColor: j5u.border, color: j5u.inkMuted }}
      >
        © 2026 Just5Up! All rights reserved.
      </div>
    </footer>
  );
}
