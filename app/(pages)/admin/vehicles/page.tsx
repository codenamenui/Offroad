// app/admin/vehicles/page.tsx
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/data/database.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Vehicle = Tables<"vehicles">;

async function getVehicles(): Promise<Vehicle[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
}

async function createVehicle(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const name = formData.get("name") as string;
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = formData.get("year") as string;
    const url = formData.get("url") as string;

    const { error } = await supabase
        .from("vehicles")
        .insert([{ name, make, model, year, url }]);

    if (error) throw error;
    revalidatePath("/admin/vehicles");
}

async function updateVehicle(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = formData.get("year") as string;
    const url = formData.get("url") as string;

    const { error } = await supabase
        .from("vehicles")
        .update({ name, make, model, year, url })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/vehicles");
    redirect("/admin/vehicles");
}

async function deleteVehicle(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const id = parseInt(formData.get("id") as string);

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/vehicles");
}

export default async function VehiclesPage({
    searchParams,
}: {
    searchParams: { edit?: string };
}) {
    const vehicles = await getVehicles();
    const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
    const editVehicle = editId ? vehicles.find((v) => v.id === editId) : null;

    return (
        <div>
            <h1>Vehicles Management</h1>

            <h2>Add New Vehicle</h2>
            <form action={createVehicle}>
                <input name="name" placeholder="Name" required />
                <input name="make" placeholder="Make" required />
                <input name="model" placeholder="Model" required />
                <input name="year" placeholder="Year" required />
                <input name="url" placeholder="URL" />
                <button type="submit">Add Vehicle</button>
            </form>

            {editVehicle && (
                <div>
                    <h2>Edit Vehicle</h2>
                    <form action={updateVehicle}>
                        <input type="hidden" name="id" value={editVehicle.id} />
                        <input
                            name="name"
                            defaultValue={editVehicle.name || ""}
                            placeholder="Name"
                            required
                        />
                        <input
                            name="make"
                            defaultValue={editVehicle.make || ""}
                            placeholder="Make"
                            required
                        />
                        <input
                            name="model"
                            defaultValue={editVehicle.model || ""}
                            placeholder="Model"
                            required
                        />
                        <input
                            name="year"
                            defaultValue={editVehicle.year || ""}
                            placeholder="Year"
                            required
                        />
                        <input
                            name="url"
                            defaultValue={editVehicle.url || ""}
                            placeholder="URL"
                        />
                        <button type="submit">Update Vehicle</button>
                    </form>
                </div>
            )}

            <h2>Vehicles List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>URL</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                            <td>{vehicle.id}</td>
                            <td>{vehicle.name}</td>
                            <td>{vehicle.make}</td>
                            <td>{vehicle.model}</td>
                            <td>{vehicle.year}</td>
                            <td>{vehicle.url}</td>
                            <td>
                                <a href={`/admin/vehicles?edit=${vehicle.id}`}>
                                    Edit
                                </a>
                                <form
                                    action={deleteVehicle}
                                    style={{ display: "inline" }}
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={vehicle.id}
                                    />
                                    <button
                                        type="submit"
                                        onClick={(e) =>
                                            !confirm("Are you sure?") &&
                                            e.preventDefault()
                                        }
                                    >
                                        Delete
                                    </button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
