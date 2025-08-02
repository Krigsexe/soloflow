"use client";

import Link from "next/link";
import Image from "next/image";

import { ContainerScroll } from "@soloflow/ui/container-scroll-animation";
import { ColourfulText } from "@soloflow/ui/colorful-text";

export function VideoScroll({ dict } : { dict: Record<string, string> | undefined }) {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white mb-8">
              {dict?.first_text}<br />
              <span className="text-4xl md:text-6xl font-bold mt-1 leading-none">
                {dict?.second_text1}<ColourfulText text={dict?.time_text ?? ''} />{dict?.second_text2}
              </span>
            </h1>
          </>
        }
      >
        <Link href="https://proxitek.fr/invite" target="_blank">
          <Image
            src={`https://i.ibb.co/qYbDhtVz/ai-brain-circuit-board-icon-600nw-2274629637.png`}
            alt="hero"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </Link>
      </ContainerScroll>
    </div>
  );
}
