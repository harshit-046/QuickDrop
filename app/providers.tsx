'use client'
import { HeroUIProvider } from '@heroui/react'
import { ClerkProvider } from "@clerk/nextjs";
import type { ThemeProviderProps } from 'next-themes';
import { ImageKitProvider } from "imagekitio-next";
export interface ProviderProps {
    children: React.ReactNode,
    themeProp?: ThemeProviderProps
}

const authenticator = async () => {
    try {
        const response = await fetch("/api/imagekit-auth");
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Image kit Authentication error :",error);
        throw error;
    }
}
export function Providers({children, themeProp} : ProviderProps ) {
    return (
        <ClerkProvider>
            <HeroUIProvider>
                <ImageKitProvider
                    authenticator={authenticator}
                    publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
                >
                    {children}
                </ImageKitProvider>
            </HeroUIProvider>
        </ClerkProvider>
    )
}