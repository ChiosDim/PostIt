export default function Footer() {
  return (
    <footer className="py-4 sm:py-8 text-center text-gray-600 text-xs sm:text-sm">
      <p>© {new Date().getFullYear()} PostIt. All rights reserved.</p>
      <p className="mt-1 font-medium">Built by Dimitris Chios</p>
    </footer>
  );
}
