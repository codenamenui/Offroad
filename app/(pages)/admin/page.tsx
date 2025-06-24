import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div>
                <Link href="/admin/vehicles">
                    <button>Manage Vehicles</button>
                </Link>
                <Link href="/admin/types">
                    <button>Manage Types</button>
                </Link>
                <Link href="/admin/parts">
                    <button>Manage Parts</button>
                </Link>
            </div>
        </div>
    );
}
