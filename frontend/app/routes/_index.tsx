import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchData } from "~/utils/api";

// Define the type for the data returned by the loader
type LoaderData = {
  message: string;
};

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const data = await fetchData("/");
  return { message: data.message };
};

export default function Index() {
  const data = useLoaderData<LoaderData>(); // Use the defined type here

  return (
    <div className="text-primary bg-background min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">{data.message}</h1>
    </div>
  );
}
