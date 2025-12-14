"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedBadgeProps {
  text?: string
  color?: string
  href?: string
  className?: string
}

export function AnimatedBadge({
  text = "New Feature",
  color = "#22d3ee",
  href,
  className,
}: AnimatedBadgeProps) {
  const pathLength = 104.54

  const pathVariants = {
    initial: { strokeDashoffset: pathLength },
    animate: { strokeDashoffset: 0 },
  }

  const glowVariants = {
    initial: { opacity: 0 },
    animate: { opacity: [0, 1, 0] },
  }

  const Badge = motion.span

  const content = (
    <Badge
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:shadow-lg",
        "border-gray-200 bg-white/80 text-gray-700 backdrop-blur-sm",
        "dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200",
        className
      )}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated Border SVG */}
      <span className="absolute inset-0">
        <svg
          className="absolute inset-0 h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx="9999"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={pathLength}
            variants={pathVariants}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 1,
            }}
          />
        </svg>
      </span>

      {/* Glow Effect */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color}20, transparent 70%)`,
        }}
        variants={glowVariants}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Pulse Dot */}
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>

      {/* Text */}
      <span className="relative z-10">{text}</span>
    </Badge>
  )

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    )
  }

  return content
}
