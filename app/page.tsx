// app/admin/page.tsx

import Image from 'next/image';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png" // Replace with your actual logo path
          alt="Eve Health Logo"
          width={120}
          height={120}
        />
      </div>

      {/* Overview */}
      <h1 className="text-2xl font-semibold mb-4">Welcome to Eve Health Admin</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Eve Health is a platform dedicated to empowering women through comprehensive reproductive and wellness care.
        Manage users, monitor insights, and keep our mission strong—from the admin hub.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link href="/login">
          <button className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="border border-primary text-primary px-6 py-2 rounded hover:bg-blue-50 transition">
            Request Access
          </button>
        </Link>
      </div>
    </div>
  );
}
