import Dashboard from "@/src/features/dashboard/Dashboard";


type SearchProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const HomePage =  () => {
    return (
        <div className="w-full">
        {/* HEADER */}
            <Dashboard />
        </div>
    );
};
export default HomePage;
