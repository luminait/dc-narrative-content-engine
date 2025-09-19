import Dashboard from "@/app/dashboard/page";


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
