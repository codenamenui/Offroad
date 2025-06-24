// app/admin/parts/page.tsx
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/data/database.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Part = Tables<"parts">;
type Vehicle = Tables<"vehicles">;
type Type = Tables<"types">;

async function getParts(): Promise<Part[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("parts")
        .select("*")
        .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
}

async function getVehicles(): Promise<Vehicle[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
}

async function getTypes(): Promise<Type[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("types")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
}

async function createPart(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const vehicle_id = formData.get("vehicle_id")
        ? parseInt(formData.get("vehicle_id") as string)
        : null;
    const type_id = formData.get("type_id")
        ? parseInt(formData.get("type_id") as string)
        : null;
    const stock = formData.get("stock")
        ? parseInt(formData.get("stock") as string)
        : null;
    const price = formData.get("price")
        ? parseFloat(formData.get("price") as string)
        : null;
    const description = formData.get("description") as string;

    const { error } = await supabase
        .from("parts")
        .insert([
            { name, url, vehicle_id, type_id, stock, price, description },
        ]);

    if (error) throw error;
    revalidatePath("/admin/parts");
}

async function updatePart(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const vehicle_id = formData.get("vehicle_id")
        ? parseInt(formData.get("vehicle_id") as string)
        : null;
    const type_id = formData.get("type_id")
        ? parseInt(formData.get("type_id") as string)
        : null;
    const stock = formData.get("stock")
        ? parseInt(formData.get("stock") as string)
        : null;
    const price = formData.get("price")
        ? parseFloat(formData.get("price") as string)
        : null;
    const description = formData.get("description") as string;

    const { error } = await supabase
        .from("parts")
        .update({ name, url, vehicle_id, type_id, stock, price, description })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/parts");
    redirect("/admin/parts");
}

async function deletePart(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const id = parseInt(formData.get("id") as string);

    const { error } = await supabase.from("parts").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/parts");
}

export default async function PartsPage({
    searchParams,
}: {
    searchParams: { edit?: string };
}) {
    const [parts, vehicles, types] = await Promise.all([
        getParts(),
        getVehicles(),
        getTypes(),
    ]);

    const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
    const editPart = editId ? parts.find((p) => p.id === editId) : null;

    return (
        <div>
            <h1>Parts Management</h1>

            <h2>Add New Part</h2>
            <form action={createPart}>
                <input name="name" placeholder="Part Name" required />
                <input name="url" placeholder="URL" />
                <select name="vehicle_id">
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} - {vehicle.make} {vehicle.model}
                        </option>
                    ))}
                </select>
                <select name="type_id">
                    <option value="">Select Type</option>
                    {types.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                <input name="stock" type="number" placeholder="Stock" />
                <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="Price"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                ></textarea>
                <button type="submit">Add Part</button>
            </form>

            {editPart && (
                <div>
                    <h2>Edit Part</h2>
                    <form action={updatePart}>
                        <input type="hidden" name="id" value={editPart.id} />
                        <input
                            name="name"
                            defaultValue={editPart.name || ""}
                            placeholder="Part Name"
                            required
                        />
                        <input
                            name="url"
                            defaultValue={editPart.url || ""}
                            placeholder="URL"
                        />
                        <select
                            name="vehicle_id"
                            defaultValue={editPart.vehicle_id || ""}
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles.map((vehicle) => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.name} - {vehicle.make}{" "}
                                    {vehicle.model}
                                </option>
                            ))}
                        </select>
                        <select
                            name="type_id"
                            defaultValue={editPart.type_id || ""}
                        >
                            <option value="">Select Type</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <input
                            name="stock"
                            type="number"
                            defaultValue={editPart.stock || ""}
                            placeholder="Stock"
                        />
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={editPart.price || ""}
                            placeholder="Price"
                        />
                        <textarea
                            name="description"
                            defaultValue={editPart.description || ""}
                            placeholder="Description"
                        ></textarea>
                        <button type="submit">Update Part</button>
                    </form>
                </div>
            )}

            <h2>Parts List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>URL</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map((part) => {
                        const vehicle = vehicles.find(
                            (v) => v.id === part.vehicle_id
                        );
                        const type = types.find((t) => t.id === part.type_id);

                        return (
                            <tr key={part.id}>
                                <td>{part.id}</td>
                                <td>{part.name}</td>
                                <td>
                                    {vehicle
                                        ? `${vehicle.name} - ${vehicle.make} ${vehicle.model}`
                                        : "N/A"}
                                </td>
                                <td>{type?.name || "N/A"}</td>
                                <td>{part.stock}</td>
                                <td>{part.price}</td>
                                <td>{part.description}</td>
                                <td>{part.url}</td>
                                <td>
                                    <a href={`/admin/parts?edit=${part.id}`}>
                                        Edit
                                    </a>
                                    <form
                                        action={deletePart}
                                        style={{ display: "inline" }}
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={part.id}
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
