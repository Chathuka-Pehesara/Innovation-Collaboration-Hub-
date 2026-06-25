export default function LoginForm() {
  return (
    <form className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Login</h1>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900"
          name="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-white">
        Sign in
      </button>
    </form>
  );
}

