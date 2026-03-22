'use client'
import { ClerkProvider } from "@clerk/nextjs";
import { HeroUIProvider } from '@heroui/react'

interface ProviderProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProviderProps) {
  return (
    <ClerkProvider>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </ClerkProvider>
  );
}
