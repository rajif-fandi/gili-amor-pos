import { redirect } from "next/navigation";

// Halaman input kg sudah digabung ke dashboard laundry.
export default function TimbangRedirect() {
  redirect("/laundry/dashboard");
}
