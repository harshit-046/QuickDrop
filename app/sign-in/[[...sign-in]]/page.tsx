import SignInForm from '@/components/SignInForm'

const Page = () => {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
      <main className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="animate-rise hidden rounded-[2rem] bg-[linear-gradient(140deg,#1f2937_0%,#111827_65%,#0f172a_100%)] p-10 text-white lg:block">
          <p className="section-title text-white/60">QuickDrop</p>
          <h1 className="mt-4 max-w-md text-5xl font-semibold leading-tight">
            Files, folders, and starred work in one focused dashboard.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Sign in to pick up where you left off. Browse nested folders, upload new assets, and recover anything in trash without leaving the workspace.
          </p>
        </section>

        <section className="animate-rise flex justify-center">
          <SignInForm />
        </section>
      </main>
    </div>
  )
}

export default Page
