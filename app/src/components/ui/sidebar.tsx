"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "chrome-sidebar-panel hidden h-full flex-shrink-0 px-3 py-4 transition-all duration-300 md:flex md:flex-col",
        className
      )}
      animate={{
        width: animate ? (open ? "304px" : "88px") : "304px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "flex h-14 w-full flex-row items-center justify-between border-b border-border/50 bg-background/75 px-5 py-4 backdrop-blur-xl md:hidden"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1], // Luxury smooth easing curve
              }}
              className={cn(
                "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between border-r border-border/50 bg-background/95 p-8 shadow-2xl backdrop-blur-3xl",
                className
              )}
            >
              <div
                className="absolute right-8 top-8 z-50 text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-background/50 p-2 rounded-full border border-border/50"
                onClick={() => setOpen(!open)}
              >
                <X className="h-5 w-5" />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  tooltip,
  ...props
}: {
  link: Links;
  className?: string;
  tooltip?: string;
} & Omit<LinkProps, "href">) => {
  const { open, animate } = useSidebar();

  const content = (
    <Link
      href={link.href}
      className={cn(
        "chrome-nav-item group/sidebar flex items-center justify-start gap-3 focus-visible:ring-2 focus-visible:ring-ring/70",
        className
      )}
      {...props}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted/45 text-muted-foreground transition-colors duration-200 group-hover/sidebar:bg-muted group-hover/sidebar:text-foreground">
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="inline-block whitespace-pre !m-0 !p-0 text-sm font-medium tracking-wide text-foreground transition-colors duration-200 group-hover/sidebar:text-foreground"
      >
        {link.label}
      </motion.span>
    </Link>
  );

  if (open || !animate || !tooltip) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
