import Navbar from "@/app/(dashboard)/components/Navbar";

export default function DashboardLayout({ children }) {
    return (
        <section>
            <Navbar />
            <div className="container mx-auto p-4">
                {children}
            </div>
        </section>
    );
}
