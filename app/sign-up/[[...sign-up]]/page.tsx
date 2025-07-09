import SignUpForm from '@/components/SignUpForm'
import React from 'react'

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex-1 flex justify-center items-center p-6">
        <SignUpForm />
      </main>
    </div>
  )
}

export default Page