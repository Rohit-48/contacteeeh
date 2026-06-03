"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon } from "@hugeicons/core-free-icons";
import { User, Globe, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { label } from "motion/react-client";

type HighlightType = "name" | "website" | "email" | "instagram" | null;
type IconComponent = React.ComponentType<{
  className?: string;
  size?: number;
  "aria-hidden"?: boolean | "true";
}>;

const InstagramGlyph: IconComponent = (props) => (
  <HugeiconsIcon icon={InstagramIcon} {...props} />
);

function AnimatedDashedBox({
  width = 0,
  x = 0,
  visible,
  label,
}: {
  width?: number;
  x?: number;
  visible?: boolean;
  label?: string;
}) {
  const paddingX = 6;
  const boxWidth = Math.max(width + paddingX * 2, 40);
  const boxHeight = 16;

  const path = `
  M 0 0
  L 0 ${boxHeight}
  L ${boxWidth} ${boxHeight}
  L ${boxWidth} 0
  `;
  return (
    <motion.div
      transition={{
        duration: 0.5,
        ease: easeOut,
      }}
      initial={{
        opacity: 0,
        x: x - paddingX,
      }}
      animate={{
        opacity: visible ? 1 : 0,
        x: x - paddingX,
      }}
      className="pointer-events-none absolute top-full left-0 mt-4 flex flex-col items-start"
      layoutId="dashed-box-whatever"
    >
      <motion.svg
        width={boxWidth}
        height={boxHeight + 2}
        viewBox={`0 0 ${boxWidth} ${boxHeight}`}
        fill="none"
        className="overflow-visible"
      >
        <motion.path
          d={path}
          stroke="var(--color-neutral-500)"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="4  4"
          initial={{
            strokeDashoffset: 0,
          }}
          animate={{
            strokeDashoffset: [0, -16],
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      </motion.svg>
      <div className="relative mt-1 h-4 min-w-16 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            className="absolute left-0 text-xs font-medium whitespace-nowrap text-neutral-500"
            key={label}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function InteracticeAddress({
  email = "rohitmandavkar@enigmalab.com",
}: {
  email?: string;
}) {
  const icons: {
    type: NonNullable<HighlightType>;
    label: string;
    icon: IconComponent;
  }[] = [
    { type: "name", label: "Name", icon: User },
    { type: "website", label: "Website", icon: Globe },
    { type: "email", label: "Email", icon: Mail },
    { type: "instagram", label: "Instagram", icon: InstagramGlyph },
  ];
  const [highlight, setHightlight] = useState<HighlightType>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const atRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  const extRef = useRef<HTMLDivElement>(null);

  const [emailName, emailDomain] = email.split("@"); // name:manu and domain:@enigmalab.com
  const domainParts = emailDomain.split("."); // domainparts --> (enigmalab, com)
  const domainName = domainParts[0];
  const domainExt = domainParts.slice(1).join("."); // domain -> com
  const website = `https://${domainName}.${domainExt}`;

  const [boxPosition, setBoxPosition] = useState<{ x: number; width: number }>({
    x: 0,
    width: 0,
  });

  useEffect(() => {
    if (!containerRef.current || !highlight) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let startx = Infinity;
    let endx = 0;

    const getSegmentsRefs = () => {
      switch (highlight) {
        case "name": {
          return [nameRef];
        }
        case "website": {
          return [domainRef, extRef];
        }
        case "email": {
          return [nameRef, atRef, domainRef, extRef];
        }
        case "instagram": {
          return [atRef, domainRef];
        }
        default: {
          return [];
        }
      }
    };
    const refs = getSegmentsRefs();

    refs.forEach((ref) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const relativeX = rect.left - containerRect.left;
        startx = Math.min(startx, relativeX);
        endx = Math.max(endx, relativeX + rect.width);
      }
    });

    if (startx !== Infinity) {
      //  What it should be: if (startx !== Infinity)Since startx was technically equal to Infinity initially, it wasn't updating boxPosition!
      // yaha pe we have to maintain the state of the box
      setBoxPosition({
        x: startx,
        width: endx - startx,
      });
    }
  }, [highlight]);

  const getSegmentStates = () => {
    switch (highlight) {
      case "name": {
        return {
          name: { active: true, blurred: false },
          at: { active: false, blurred: true },
          domain: { active: false, blurred: true },
          ext: { active: false, blurred: true },
          label: "Name",
        };
      }
      case "website": {
        return {
          name: { active: false, blurred: true },
          at: { active: true, blurred: false },
          domain: { active: true, blurred: false },
          ext: { active: true, blurred: false },
          label: "website",
        };
      }
      case "instagram": {
        return {
          name: { active: false, blurred: true },
          at: { active: true, blurred: false },
          domain: { active: true, blurred: false },
          ext: { active: false, blurred: true },
          label: "instagram",
        };
      }
      case "email": {
        return {
          name: { active: true, blurred: false },
          at: { active: true, blurred: false },
          domain: { active: true, blurred: false },
          ext: { active: true, blurred: false },
          label: "mail",
        };
      }

      default: {
        return {
          name: { active: false, blurred: false },
          at: { active: false, blurred: false },
          domain: { active: false, blurred: false },
          ext: { active: false, blurred: false },
        };
      }
    }
  };

  const segmentStates = getSegmentStates();
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* main address display  */}
      <div className="relative  flex min-h-28 flex-col items-center">
        <div
          ref={containerRef}
          className="relative flex item-center justify-center text-3xl font-medium tracking-tight md:text-4xl"
        >
          <TextSegment
            isActive={segmentStates.name.active}
            isBlurred={segmentStates.name.blurred}
            segmentRef={nameRef as React.RefObject<HTMLSpanElement>}
          >
            {emailName}
          </TextSegment>
          <TextSegment
            isActive={segmentStates.at.active}
            isBlurred={segmentStates.at.blurred}
            segmentRef={atRef as React.RefObject<HTMLSpanElement>}
          >
            @
          </TextSegment>
          <TextSegment
            isActive={segmentStates.domain.active}
            isBlurred={segmentStates.domain.blurred}
            segmentRef={domainRef as React.RefObject<HTMLSpanElement>}
          >
            {domainName}
          </TextSegment>
          <TextSegment
            isActive={segmentStates.ext.active}
            isBlurred={segmentStates.ext.blurred}
            segmentRef={extRef as React.RefObject<HTMLSpanElement>}
          >
            .{domainExt}
          </TextSegment>

          <AnimatedDashedBox
            width={boxPosition.width}
            x={boxPosition.x}
            visible={highlight !== null}
            label={segmentStates.label}
          />
        </div>
      </div>

      {/* icons container row */}
      <div className="mt-4 flex items-center gap-3">
        {icons.map(({ type, label, icon: Icon }) => (
          <motion.button
            key={type}
            type="button"
            onMouseEnter={() => setHightlight(type)}
            onMouseLeave={() => setHightlight(null)}
            aria-label={label}
            title={label}
            className="relative rounded-lg p-2 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon
              className="transition-colors duration-150"
              size={18}
              aria-hidden="true"
            />
            <AnimatePresence>
              {highlight === type && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 -z-10 rounded-lg bg-neutral-500/10"
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

interface TextSegmentProps {
  children: React.ReactNode;
  isActive: boolean;
  isBlurred: boolean;
  segmentRef: React.RefObject<HTMLSpanElement>;
}
const TextSegment = ({
  children,
  isActive,
  isBlurred,
  segmentRef,
}: TextSegmentProps) => {
  return (
    <motion.span
      ref={segmentRef as React.RefObject<HTMLSpanElement>}
      animate={{
        filter: isBlurred ? "blur(4px)" : "blur(0px)",
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className={cn(
        "tracking-tight",
        isActive ? "text-neutral-900" : "text-neutral-400",
      )}
    >
      {children}
    </motion.span>
  );
};
