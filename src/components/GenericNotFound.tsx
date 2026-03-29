import Link from "next/link";

interface GenericNotFoundProps {
  title?: string;
  message?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function GenericNotFound({
  title = "404",
  message = "The resource you're looking for doesn't exist.",
  buttonText = "Go Home",
  buttonHref = "/",
}: GenericNotFoundProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
      <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
        {title}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
        {message}
      </h1>
      <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div className="mt-6">
        <Link
          href={buttonHref}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
