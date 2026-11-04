"use client";

import { useState } from "react";
import Image from "next/image";
import type { Screenshot } from "@/data/screenshots";

type Props = {
  screenshots: Screenshot[];
};

export default function ScreenshotGallery({ screenshots }: Props) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="mt-8">
      <Image
        src={screenshots[current].image_url}
        alt={`画面 ${current + 1}`}
        width={1080}
        height={2340}
        className="mx-auto h-120 w-auto rounded-lg border border-zinc-200"
      />
      <ul className="mt-4 flex justify-center gap-2">
        {screenshots.map((s, index) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setCurrent(index)}
              className={`rounded-md border-2 ${index === current ? "border-zinc-900" : "border-transparent"}`}
            >
              <Image
                src={s.image_url}
                alt={`画面 ${index + 1}を表示`}
                width={1080}
                height={2340}
                className="h-24 w-auto rounded"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
