import SignUpForm from '@/components/SignUpForm'

const Page = () => {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6 py-10">
      <main className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="animate-rise flex justify-center lg:order-2">
          <SignUpForm />
        </section>

        <section className="animate-rise hidden rounded-[2rem] bg-[linear-gradient(145deg,#fffaf0_0%,#f3e7d2_100%)] p-10 lg:block">
          <p className="section-title">New workspace</p>
          <h1 className="mt-4 max-w-md text-5xl font-semibold leading-tight text-[var(--foreground)]">
            Build your own cloud desk in a minute.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            Create your account to unlock uploads, nested folders, starred items, trash recovery, and a cleaner way to manage files.
          </p>
        </section>
      </main>
    </div>
  )
}

export default Page
