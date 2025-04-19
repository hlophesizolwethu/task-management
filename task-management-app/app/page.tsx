import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-600 hover:text-purple-900">VerziBiz Members</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your tasks</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

