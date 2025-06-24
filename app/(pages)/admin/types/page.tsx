// app/admin/types/page.tsx
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/data/database.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Type = Tables<"types">;

async function getTypes(): Promise<Type[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("types")
        .select("*")
        .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
}

async function createType(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const name = formData.get("name") as string;

    const { error } = await supabase.from("types").insert([{ name }]);

    if (error) throw error;
    revalidatePath("/admin/types");
}

async function updateType(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;

    const { error } = await supabase
        .from("types")
        .update({ name })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/types");
    redirect("/admin/types");
}

async function deleteType(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const id = parseInt(formData.get("id") as string);

    const { error } = await supabase.from("types").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/admin/types");
}

export default async function TypesPage({
    searchParams,
}: {
    searchParams: { edit?: string };
}) {
    const types = await getTypes();
    const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
    const editType = editId ? types.find((t) => t.id === editId) : null;

    return (
        <div>
            <h1>Types Management</h1>

            <h2>Add New Type</h2>
            <form action={createType}>
                <input name="name" placeholder="Type Name" required />
                <button type="submit">Add Type</button>
            </form>

            {editType && (
                <div>
                    <h2>Edit Type</h2>
                    <form action={updateType}>
                        <input type="hidden" name="id" value={editType.id} />
                        <input
                            name="name"
                            defaultValue={editType.name || ""}
                            placeholder="Type Name"
                            required
                        />
                        <button type="submit">Update Type</button>
                    </form>
                </div>
            )}

            <h2>Types List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {types.map((type) => (
                        <tr key={type.id}>
                            <td>{type.id}</td>
                            <td>{type.name}</td>
                            <td>
                                <a href={`/admin/types?edit=${type.id}`}>
                                    Edit
                                </a>
                                <form
                                    action={deleteType}
                                    style={{ display: "inline" }}
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={type.id}
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
