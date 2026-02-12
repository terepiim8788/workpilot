import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <div className="flex min-h-screen">

          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
            <h2 className="text-xl font-bold mb-6">
              WorkPilot
            </h2>

            <nav className="space-y-3">
              <a
                href="/"
                className="block px-3 py-2 rounded hover:bg-gray-100"
              >
                Dashboard
              </a>
            </nav>
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col">

            {/* Header */}
            <header className="bg-white shadow px-6 py-4 flex justify-between">
              <h1 className="font-semibold">
                WorkPilot
              </h1>
            </header>

            {/* Page Content */}
            <main className="p-6">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  )
}
