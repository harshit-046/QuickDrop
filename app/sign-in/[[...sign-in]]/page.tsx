'use client'
import SignInForm from '@/components/SignInForm'
import { HeroUIProvider } from '@heroui/react'

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex-1 flex justify-center items-center p-6">
        <HeroUIProvider>
          <SignInForm />
        </HeroUIProvider>
      </main>
    </div>
  )
}

export default Page