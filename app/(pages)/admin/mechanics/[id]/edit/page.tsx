// app/admin/mechanics/[id]/edit/page.tsx
import { getMechanic } from "./actions";
import UpdateMechanicForm from "./update-mechanic-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditMechanicPage({ params }: PageProps) {
    const { id } = await params;
    const mechanic = await getMechanic(id);

    if (!mechanic) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Edit Mechanic Account
                </h1>
                <p className="text-gray-600">
                    Update the mechanic&apos;s account information and profile
                    details.
                </p>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <UpdateMechanicForm mechanic={mechanic} />
            </div>
        </div>
    );
}
